/* jshint node: true */
'use strict';

var WebSocketServer = require('websocket').server;
var http = require('http');
var portnumber = 8079;

// Create a simple web server that returns the same response for any request
var server = http.createServer(function(request,response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end("This is the node.js HTTP server.");
});

server.listen(portnumber, function() {
    console.log('Server has started listening on port ' + portnumber);
});

var wsServer = new WebSocketServer({
    httpServer:server,
    autoAcceptConnections: false
});

var players = [];
// Initialize a set of rooms
var gameRooms = [];
for (var i = 0; i < 8; i += 1) {
    gameRooms.push({status: "empty", players: [], roomId: i + 1});
}

wsServer.on('request', function(request) {
    if(!connectionIsAllowed(request)) {
        request.reject();
        console.log('Connection from ' + request.remoteAddress + ' rejected.');
        return;
    }

    var connection = request.accept();
    console.log('Connection from ' + request.remoteAddress + ' accepted.');

    // Add the player to the players array
    var player = {
        connection:connection
    };
    players.push(player);

    // Send a fresh game room status list the first time player connects
    sendRoomList(connection);

	// On Message event handler for a connection
	connection.on('message', function(message) {
	    if (message.type === 'utf8') {
	        var clientMessage = JSON.parse(message.utf8Data);
	        switch (clientMessage.type) {
                case "new_connection":
                    player.acronym = clientMessage.acronym;
                    sendChatMessage("entered the lobby", player.acronym);
                    console.log(player.acronym + " new connection");
                    break;
                case "chat":
                    var cleanedMessage = htmlEntities(clientMessage.text);
                    sendChatMessage(cleanedMessage, player.acronym);
                    break;
	            case "join_room":
	                var room = joinRoom(player, clientMessage.roomId);
	                sendRoomListToEveryone();
                    sendChatMessage("joined Sector " + clientMessage.roomId, player.acronym);
	                if (room.players.length === 2) {
	                    initGame(room);
	                }
	                break;
                case "signal":
                    sendRoomWebSocketMessageToPeer(player.room, player, clientMessage);
                    break;
                case "ready":
                    player.room.playersReady += 1;
                    if (player.room.playersReady === 2) {
                        startGame(player.room);
                    }
                    break;
                case "reset_ready":
                    player.room.playersReady = 0;
                    break;
	            case "leave_room":
	                leaveRoom(player, clientMessage.roomId);
	                sendRoomListToEveryone();
                    sendChatMessage("left Sector " + clientMessage.roomId, player.acronym);
	                break;
	            case "initialized_level":
	                player.room.playersReady += 1;
	                if (player.room.playersReady === 2) {
	                    startGame(player.room);
	                }
	                break;
	        }
	    }
	});

    connection.on('close', function(reasonCode, description) {
	    console.log('Connection from ' + request.remoteAddress + ' disconnected.');

	    for (var i = players.length - 1; i >= 0; i -= 1) {
	        if (players[i] === player){
	            players.splice(i, 1);
	        }
	    }

	    // If the player is in a room, remove him from room and notify everyone
	    if (player.room) {
	        //var status = player.room.status;
	        var roomId = player.room.roomId;

			leaveRoom(player, roomId);
	        sendRoomListToEveryone();
	    }
        sendChatMessage("has left", player.acronym);
	});
});

function sendRoomList(connection) {
    var status = [];
    for (var i = 0; i < gameRooms.length; i += 1) {
        status.push(gameRooms[i].status);
    }
    var clientMessage = {type: "room_list", status: status};
    connection.send(JSON.stringify(clientMessage));
}

function sendRoomListToEveryone() {
    // Notify all connected players of the room status changes
    var status = [];
    for (var i = 0; i < gameRooms.length; i += 1) {
        status.push(gameRooms[i].status);
    }
    var clientMessage = {type: "room_list", status: status};
    var clientMessageString = JSON.stringify(clientMessage);
    for (var j = 0; j < players.length; j += 1) {
        players[j].connection.send(clientMessageString);
    }
}

function joinRoom(player, roomId) {
    var room = gameRooms[roomId - 1];
    console.log("Adding player to room", roomId);
    // Add the player to the room
    room.players.push(player);
    player.room = room;
    // Update room status
    if (room.players.length === 1) {
        room.status = "waiting";
        player.shiptype = "smugglership";
        player.isInitiator = true;
    } else if (room.players.length === 2) {
        room.status = "starting";
        player.shiptype = "gunship";
        player.isInitiator = false;
    }
    // Confirm to player that he was added
    var confirmationMessageString = JSON.stringify({type: "joined_room", roomId: roomId, shiptype: player.shiptype, isInitiator: player.isInitiator});
    player.connection.send(confirmationMessageString);
    return room;
}

function sendChatMessage(message, from) {
    var messageString = {type:"chat", message: message, from: from};
    var broadcastMessage = JSON.stringify(messageString);
    for (var i = 0; i < players.length; i += 1) {
        players[i].connection.send(broadcastMessage);
    }
}

function leaveRoom(player, roomId) {
    var room = gameRooms[roomId - 1];
    console.log("Removing player from room", roomId);

    for (var i = room.players.length - 1; i >= 0; i -= 1) {
        if (room.players[i] === player){
            room.players.splice(i, 1);
        }
    }
    delete player.room;
    // Update room status
    if (room.players.length === 0) {
        room.status = "empty";
    } else if (room.players.length === 1) {
        room.status = "waiting";
    }
}

function initGame(room) {
    console.log("Both players Joined. Initializing game for Room " + room.roomId);
    // Number of players who have loaded the level
    room.playersReady = 0;
    room.lost = 0;
    sendRoomWebSocketMessage(room, {type: "init_game"});
}

function startGame(room) {
    console.log("Both players are ready. Starting game in room", room.roomId);
    room.status = "running";
    sendRoomListToEveryone();
    // Notify players to start the game
    sendRoomWebSocketMessage(room, {type: "start_game"});
}

function sendRoomWebSocketMessage(room, messageObject) {
    var messageString = JSON.stringify(messageObject);
    for (var i = room.players.length - 1; i >= 0; i -= 1) {
        room.players[i].connection.send(messageString);
    }
}

function sendRoomWebSocketMessageToPeer(room, fromPlayer, messageObject) {
    var messageString = JSON.stringify(messageObject);
    for (var i = room.players.length - 1; i >= 0; i -= 1) {
        if (room.players[i].connection !== fromPlayer.connection) {
            room.players[i].connection.send(messageString);
        }
    }
}

// Logic to determine whether a specified connection is allowed.
function connectionIsAllowed(request){
    // Check criteria such as request.origin, request.remoteAddress
    /*
    if (request.origin === 'http://localhost' || request.origin === 'http://127.0.0.1:8080' || request.origin === 'http://www.student.bth.se' || request.remoteAddress === 'http://10.0.1.7') {
        return true;
    } else {
        return false;
    }
    */
   return true;
}

/**
* Avoid injections
*
*/
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
