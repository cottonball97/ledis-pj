
var con = new SimpleConsole({
	handleCommand: handle_command,
	placeholder: "Enter Command",
	storageID: "simple-console demo"
});
document.body.appendChild(con.element);

con.logHTML(
	"<h1>Welcome to Ledis!</a></h1>" 
);

let dict ={};
let Data = function (){
	this.value;
	this.type;
	this.expire;
}
function handle_command(command){
	command = command.trim(); // remove space at both sides
	command = command.replace(/ +(?= )/g,''); // remove duplicate space
	let splitRes= command.split(" ");
	switch( splitRes[0] ) {
		case "set":
		set(splitRes);
		break;
		case "get":
		get(splitRes);
		break;
		case "sadd":
		sadd(splitRes);
		break;
		case "smembers":
		smembers(splitRes);
		break;
		case "srem":
		srem(splitRes);
		break;
		case "keys":
		keys(splitRes);
		break;
		case "del":
		del(splitRes);
		break;
		case "expire":
		expire(splitRes);
		break;
		case "ttl":
		ttl(splitRes);
		break;
		case "save":
		save(splitRes);
		break;
		case "restore":
		restore(splitRes);
		break;
		case "clear":
		clear(splitRes);
		 default:
		con.log("Wrong input.");
			break;
	}
};
function hasExpired(data){
	if (!data.expire){
	return false;
	}
	let time = new Date().getTime() - data.expire;
	if (time > 0){
		console.log("Key doesn't exist"); // already expired)
		return true;}
	else return false;
}
function set(splitRes ){
	if (splitRes.length == 3){
		let key= splitRes[1];
		let value = splitRes[2];
		let data = new Data();
		data.value= value;
		data.type= "String";
		data.expire = "";
		dict[key]=data;
		con.log("ok");
	}
	else con.log("wrong input");
}

function get(splitRes) {
	if (splitRes.length != 2){
		con.log("Wrong input");
		return; 
	}
	if (!dict.hasOwnProperty(splitRes[1])){
		con.log("Key doesn't exist");
		return;
	}
	
	if (hasExpired(dict[splitRes[1]])) {
		con.log("Key doesnt't exist");
		delete dict[splitRes[1]];
		return;
	}
	
	if ( dict[splitRes[1]].type==="String" ) {
		con.log(dict[splitRes[1]].value); 
	}
	
	else {
		con.log("Operation against a key holding the wrong kind of value")
	}
	
}

function sadd(splitRes){
	if (splitRes.length < 3){
		con.log("Wrong input");
		return; 
	}
	if(dict.hasOwnProperty(splitRes[1]) && hasExpired(dict[splitRes[1]]) ) { //after expired, delete, => else to create new set
		delete dict[splitRes[1]];
	};	
	if (dict.hasOwnProperty(splitRes[1])){
		if (dict[splitRes[1]].type==="String"){
			con.log("Operation against a key holding the wrong kind of value"); // Key already exist in dict
			return; 
		}		
		if ( dict[splitRes[1]].type==="Set"){ // sadd key1 e f . 		 key1 [ 4] = e 
			for (let i=2; i < splitRes.length; i++) { 
			dict[splitRes[1]].value.add(splitRes[i]);
			}	
		}
	}
	
	else {
		let tempSet = new Set();
		for (let i=2; i < splitRes.length; i++) { 
		tempSet.add(splitRes[i]);
		}
		let data = new Data();
		data.value= tempSet;
		data.type= "Set";
		dict[splitRes[1]]=data;
	}
	con.log("ok");
}

function smembers(splitRes) {
	if (splitRes.length != 2){
		con.log("Wrong input");
		return; 
	}
	if (!dict.hasOwnProperty(splitRes[1])){
		con.log("Key doesn't exist");
		return;
	}
	
	if(hasExpired(dict[splitRes[1]]) ) {
		con.log("Key doesn't exist");
		delete dict[splitRes[1]];
		return;
	};
	
	if (dict[splitRes[1]].type ==="Set") {
		let value = Array.from(dict[splitRes[1]].value);
	con.log(value); 
	}
	else if(dict[splitRes[1]].type==="String") {
	con.log("Operation against a key holding the wrong kind of value");}

};

function srem(splitRes) {
	if (splitRes.length <3){
		con.log("Wrong input");
		return; 
	}
	if (!dict.hasOwnProperty(splitRes[1])){
		con.log("Key doesn't exist");
		return;
	}
	if(hasExpired(dict[splitRes[1]]) ) {
		delete dict[splitRes[1]];
	}
	if (dict[splitRes[1]].type==="Set") {
		for (let i=2; i < splitRes.length; i++) { 
			if (dict[splitRes[1]].value.has(splitRes[i])) {
				con.log(splitRes[i] + " is removed");
			dict[splitRes[1]].value.delete(splitRes[i]);
			}
			else con.log("This set doesn't have this value to be removed:" + splitRes[i]);
		}
		
		let value = Array.from(dict[splitRes[1]].value);
		con.log("The set after removal:");
		con.log(value); 
	}
	else if(dict[splitRes[1]].type==="String") {
	con.log("Operation against a key holding the wrong kind of value");}
	
};

// DATA EXPIRATION

function keys(splitRes){
		 if (splitRes.length != 1) {
	 con.log("Wrong input");
	 return;
	 }
	let keys = Object.keys(dict);
	var availableKeys = keys.filter(function(key) {
		return (!hasExpired(dict[key]));
	});
	con.log(availableKeys);
	console.log(availableKeys.type);
}


function del(splitRes){
	let prop = splitRes[1];
	if (!dict.hasOwnProperty(prop)){
		con.log("Key doesn't exist");
		return;
	}
	if(hasExpired(dict[prop]) ) 	{
		delete dict[prop];
	}
		con.log(prop + " is deleted")
		delete dict[prop];
		let keys = Object.keys(dict);
		var availableKeys = keys.filter(function(key) {
		return (!hasExpired(dict[key]));
	});
	con.log("remaining keys: " + availableKeys);
}
	//EXPIRE key seconds: set a timeout on a key, seconds is a positive integer (by default a key has no expiration). Return the number of seconds if the timeout is set
function expire(splitRes) {
		if (splitRes.length != 3){
			con.log("Wrong input");
			return;
		} 
		let key= splitRes[1];
		let seconds= splitRes[2];
		
		if (seconds > 0 && dict.hasOwnProperty(key)) {

			if (!dict[key].expire  ){
			dict[key].expire = new Date().getTime() + seconds*1000;
			con.log(seconds + " seconds");
			
				console.log(dict[key].expire);
			}
			else{
				if (new Date().getTime() - dict[key].expire > 0){
					con.log("Key doesn't exist");
				}
				else {				
				dict[key].expire = new Date().getTime() + seconds*1000;
				con.log(seconds + " seconds");
				console.log(dict[key].expire);
				}
			}
		}
}

function ttl(splitRes){
	let key= splitRes[1];
	let secLeft;
	if (!dict.hasOwnProperty(key)){
		con.log("Key doesn't exist");
		return;
	}
	
	if(!dict[key].expire){
		con.log("Key doesn't have expire time");
		return;
	}
	
	if (hasExpired(dict[key])){
		delete dict[key];
		con.log("This key has expired!");
	}
	else {
		secLeft= new Date().getTime() - dict[key].expire;
		con.log(Math.round(Math.abs(secLeft/1000))+ " seconds");
	
	}
}

function save(splitRes){
	 if (splitRes.length != 1) {
	 con.log("Wrong input");
	 return;
	 }
	 
	localStorage.setItem("snapshot", JSON.stringify(dict));
}
function restore(splitRes){
		 if (splitRes.length != 1) {
	 con.log("Wrong input");
	 return;
	 }
	 if (localStorage.getItem("snapshot")){
	var snapshot = localStorage.getItem("snapshot");
	 dict = JSON.parse(snapshot);
	console.log(dict);
	 }
	 else con.log("Nothing to restore.");
}
function clear(splitRes){
		 if (splitRes.length != 1) {
	 con.log("Wrong input");
	 return;
	 }
	localStorage.clear();
}
