/*	Winter 2017 SENG 513 Assignment 3
	Vincent Wong 10046391
	index.js
	*/

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
let names = ["Alligator", "Armadillo", "Buffalo", "Bear", "Camel", "Cheetah", "Dinosaur", "Dolphin", "Elephant", "Ferret",
"Fox", "Giraffe", "Grizzly", "Hedgehog", "Hyena", "Iguana", "Kangaroo", "Koala", "Leopard", "Llama", "Monkey", "Moose",
"Otter", "Panda", "Penguin", "Rabbit", "Rhino", "Sheep", "Squirrel", "Tiger", "Turtle", "Wolf", "Warus"];

let connectedNames = [];
let messageLog = [];

function printConnectedNames(){
	io.emit('clear list');
	io.emit('user list', "Online Users: ");
	for(let i = 0; i < connectedNames.length; i++){
		io.emit('user list', connectedNames[i]);
	}
}

function removeConnectedNames(a){
	for(let j = connectedNames.length-1; j>=0; j--){
		if(connectedNames[j] === a){
			connectedNames.splice(j ,1);
		}
	}
}

function pushMessageLog(a){
	if (messageLog.length <= 200){
		messageLog.push(a);
	}
	else{
		messageLog.shift();
		messageLog.push(a);
	}
}

function printMessageLog(socket){
	for(let i = 0; i < messageLog.length; i++){
		socket.emit('chat message', messageLog[i]);
	}
}

function checkExistingNames(a){
	for(let i = 0; i < connectedNames.length; i++){
		tempStr = connectedNames[i];
		tempStr = String(tempStr);
		if(a.toUpperCase() === tempStr.toUpperCase()){
			return true;
		}
	}
	return false;
}

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  var userName = names.splice(Math.floor(Math.random()*names.length), 1);
  console.log('a user ' + userName + ' is connected');
  
  connectedNames.push(userName);
  printConnectedNames();
  printMessageLog(socket);
  socket.emit('chat message', "You are " + userName);
  
  socket.on('disconnect', function(){
	console.log('user ' + userName +  ' is disconnected');
	names.push(userName);
	removeConnectedNames(userName);
	printConnectedNames();
  });
  
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
  
  socket.on('chat message', function(msg){
	// change nickname
	if(msg.includes("/nick")){
		let command = msg.substr(0,msg.indexOf(' '));
		let tempName = msg.substr(msg.indexOf(' ')+1);
		if(command === "/nick"){
			if(checkExistingNames(tempName)===true){
				socket.emit('chat message', "Sorry name is being used, please use another name");
			}
			else{
				names.push(userName);
				removeConnectedNames(userName);
				userName = tempName;
				connectedNames.push(userName);
				printConnectedNames();
				socket.emit('chat message', "Your name has changed to " + userName);
			}
		}
		// change name color
		else if(command === "/nickcolor"){
			let str1 = "<span style=\"color:";
			let str2 = "\">"
			let str3 = "</span> ";
			str1 = str1.concat(tempName);
			str1 = str1.concat(str2);
			userName = str1.concat(userName);
			userName = userName.concat(str3);
		}
	}
	// broadcast message with timestamp
	else{
		let date = new Date();
		let newMsg = "[" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "] " + userName + ": " + msg;
		socket.emit('bold message', newMsg);
		socket.broadcast.emit('chat message', newMsg);
		pushMessageLog(newMsg);
	}
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});