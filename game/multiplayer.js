/* jshint node: true */
/* jshint -W030 */
/* global Asteroids, RTCSessionDescription, RTCPeerConnection, RTCIceCandidate */

window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

'use strict';
var multiplayer = {
    // Open multiplayer game lobby
    websocket_url:"ws://10.0.1.68:8079",
    //websocket_url:"ws://nodejs2.student.bth.se:8079",
    websocket:undefined,

	acronym: undefined,
	lastCommand: undefined,
	commands: [],
    ready: false,
    peerReady: false,
    asteroidsArray: [],
    asteroidTick: 0,

    //Signaling Code Setup
    isInitiator: false,
    configuration: {
        'iceServers': [{
            'urls': 'stun:stun.l.google.com:19302'
        }]
    },
    rtcPeerConn: undefined,
    dataChannelOptions: {
        ordered: false, //no guaranteed delivery, unreliable but faster
        maxPacketLifeTime: 1000, //milliseconds
    },
    dataChannel: undefined,
    latencyTrips: [],
    averageLatency: 0,
    latencyResult: 0,
    tickLag: 0,

	start: function() {
        var WebSocketObject = window.WebSocket || window.MozWebSocket;
        if (!WebSocketObject){
            alert("Your browser does not support WebSocket. Multiplayer will not work.");
            return;
        }
        this.websocket = new WebSocketObject(this.websocket_url);
        this.websocket.onmessage = multiplayer.handleWebSocketMessage;

        this.websocket.onerror = function() {
            console.log('Connection Error');
            $('#connectPara').html('No Connection');
            //multiplayer.endGame("Error connecting to server.");
        };
        // Display multiplayer lobby screen after connecting
        this.websocket.onopen = function(){
            console.log("Connected to socket server");
            multiplayer.enterLobby();
        };

        this.websocket.onclose = function() {
            console.log('Disconnected from socket server');
            multiplayer.endGame("Error connecting to server.");
        };
	},
    handleWebSocketMessage: function(message) {
        var messageObject = JSON.parse(message.data);
        switch (messageObject.type) {
            case "room_list":
                multiplayer.updateRoomStatus(messageObject.status);
                break;
            case "chat":
                multiplayer.updateChatLog(messageObject.from, messageObject.message);
                break;
            case "joined_room":
                multiplayer.roomId = messageObject.roomId;
                multiplayer.shiptype = messageObject.shiptype;

                if (messageObject.isInitiator) {
                    multiplayer.isInitiator = true;
                } else {
                    multiplayer.sendWebSocketMessage({type:"signal", message: "user_here", roomId: messageObject.roomId});
                }
                break;
            case "init_game":
                $('#cancelConnect').click(function(e) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    multiplayer.cancel();
                    $("#connectingDataChannel").hide();
                    multiplayer.enterLobby();
                });
                $("#multiplayerlobbyscreen").hide();
                $("#connectingDataChannel").fadeIn('slow');
                break;
            case "signal":

                //Setup the RTC Peer Connection object
                if (!multiplayer.rtcPeerConn) {
                    console.log("setup RTCPeerConnection");
                    multiplayer.startSignal(multiplayer.isInitiator);
                }

                var rtc_message = messageObject;
                if (rtc_message.desc) {
                    var desc = rtc_message.desc;

                    // if we get an offer, we need to reply with an answer
                    if (desc.type === "offer") {
                        multiplayer.rtcPeerConn.setRemoteDescription(new RTCSessionDescription(desc)).then(function () {
                            return multiplayer.rtcPeerConn.createAnswer();
                        })
                        .then(function (answer) {
                            return multiplayer.rtcPeerConn.setLocalDescription(answer);
                        })
                        .then(function () {
                            multiplayer.sendWebSocketMessage({type:"signal", desc: multiplayer.rtcPeerConn.localDescription });
                        })
                        .catch(multiplayer.onCreateSessionDescriptionError);
                    } else if (desc.type === "answer") {
                        multiplayer.rtcPeerConn.setRemoteDescription(new RTCSessionDescription(desc)).catch(multiplayer.onCreateSessionDescriptionError);
                    } else {
                        console.log('Unsupported SDP type');
                    }
                } else if (rtc_message.candidate) {
                    console.log('Add ICS candidate');
                    multiplayer.rtcPeerConn.addIceCandidate(new  RTCIceCandidate(rtc_message.candidate)).catch(multiplayer.onCreateSessionDescriptionError);
                }

                break;
            case "start_game":
                multiplayer.startGame();
                break;
        }
    },
	enterLobby: function() {
		var mpJoin = $("#multiplayerjoin");
		var mpCancel = $("#multiplayercancel");

		$('#connecting').hide();

		if ($("#player_acronym").val()) {
            multiplayer.acronym = $("#player_acronym").val().toUpperCase();
        } else {
        	multiplayer.acronym = 'NOB';
        }

        multiplayer.sendWebSocketMessage({type: "new_connection", acronym: multiplayer.acronym});

        $("#gameIntro").fadeOut(75);
        $("#multiplayerlobbyscreen").fadeIn(500);

        mpJoin.on('click', function(e) {
        	e.stopImmediatePropagation();
        	e.preventDefault();
        	multiplayer.join();
        });

        mpCancel.on('click', function(e) {
        	e.stopImmediatePropagation();
            e.preventDefault();
            multiplayer.cancel();
        });

        // event-handler for message text
	    $("#chatmessage").keypress(function (e) {
	        var message;
	        var msg;
	        if (e.which === 13) {
	            message = $('#chatmessage').val();
	            e.preventDefault();
	            if (message.length > 0) {
		            $("#chatmessage").blur();
		            $("#chatmessage").val('');
		            $("#chatmessage").prop('placeholder', 'Type message, hit return');
		            $('#chatmessage').focus();

	                msg = {
	                    type: "chat",
	                    text: message,
	                };

	                $('#chatmessage').val('');
	                multiplayer.sendWebSocketMessage(msg);
	            }
	        }
	    });

        // event-handler for message text WebRTC
        $("#chatmessageWebRTC").keypress(function (e) {
            var messageWebRTC;
            var msgWebRTC;
            var chatlogWebRTC = $("#chatlogWebRTC");
            if (e.which === 13) {
                messageWebRTC = $('#chatmessageWebRTC').val();
                e.preventDefault();
                if (messageWebRTC.length > 0) {
                    $("#chatmessageWebRTC").blur();
                    $("#chatmessageWebRTC").val('');
                    $("#chatmessageWebRTC").prop('placeholder', 'Type message, hit return');
                    $('#chatmessageWebRTC').focus();

                    msgWebRTC = {
                        type: "dc_chat",
                        from: multiplayer.acronym,
                        text: messageWebRTC,
                    };

                    $('#chatmessageWebRTC').val('');
                    multiplayer.sendDataChannelMessage(msgWebRTC);
                    $("#chatmessageslistWebRTC").append('<li>ME: ' + messageWebRTC + '</li>');
                    chatlogWebRTC.scrollTop(chatlogWebRTC[0].scrollHeight);
                }
            }
        });
	},
	statusMessages: {
        'starting':'Game Starting',
        'running':'Game in Progress',
        'waiting':'Awaiting second player',
        'empty':'Open'
    },
    updateChatLog: function(from, message) {
    	var chatlog = $("#chatlog");
    	$("#chatmessageslist").append('<li>' + from + ': ' + message + '</li>');
        chatlog.scrollTop(chatlog[0].scrollHeight);
    },
    updateRoomStatus: function(status) {
    	var key;
        var $list = $("#multiplayergameslist");
        $list.empty(); // remove old options
        for (var i = 0; i < status.length; i += 1) {
            key = "Sector " + (i + 1) + ". " + this.statusMessages[status[i]];
            $list.append($("<option></option>")
            	.attr("disabled", status[i] === "running" || status[i] === "starting")
            	.attr("value", (i + 1))
            	.text(key)
            	.addClass(status[i])
            	.attr("selected", (i + 1) === multiplayer.roomId));
		}
	},
	join: function() {
    	var selectedRoom = $('#multiplayergameslist').val();
    	if(selectedRoom){
        	multiplayer.sendWebSocketMessage({type: "join_room", roomId: selectedRoom, acronym: multiplayer.acronym});
        	$('#multiplayergameslist').prop('disabled', 'disabled');
        	$('#multiplayerjoin').prop('disabled', 'disabled');
        	$("#lobbyMessage").hide();
    	} else {
        	$("#lobbyMessagePara").html("Please select a sector to join.").addClass('flash');
        	$("#lobbyMessage").show();
        	setTimeout(function() {
        		$("#lobbyMessage").hide();
        	}, 3000);
		}
	},
	cancel: function() {
     	// Leave any existing game room
     	if(multiplayer.roomId){
        	multiplayer.sendWebSocketMessage({type: "leave_room", roomId: multiplayer.roomId});
        	$('#multiplayergameslist').prop('disabled', false);
        	$('#multiplayerjoin').prop('disabled', false);
        	delete multiplayer.roomId;
        	return;
    	} else {
        	// Not in a room, so leave the multiplayer screen itself
        	multiplayer.closeAndExit();
    	}
	},
	closeAndExit: function() {
        // clear handlers and close connection
        var msgWebRTC2 = {
                        type: "dc_chat",
                        from: multiplayer.acronym,
                        text: "disconnect from datachannel",
                    };
        multiplayer.sendDataChannelMessage(msgWebRTC2);
        multiplayer.closeDataChannel();

        multiplayer.websocket.onopen = null;
        multiplayer.websocket.onclose = null;
        multiplayer.websocket.onerror = null;
        multiplayer.websocket.close();
        console.log('Disconnected from socket server');

    	$('#multiplayergameslist').prop('disabled', false);
    	$('#multiplayerjoin').prop('disabled', false);
    	// Show the starting menu layer
    	$("#multiplayerlobbyscreen").hide(10);
    	$("#chatmessageslist").empty();
        $("#chatmessageslistWebRTC").empty();
    	Asteroids.resetGame();
    	Asteroids.render();
        $("#gameIntro").delay(50).fadeIn(500);
        Asteroids.closeMP();
	},
	sendWebSocketMessage: function(messageObject) {
    	multiplayer.websocket.send(JSON.stringify(messageObject));
	},

	startGame: function(messageObject) {
		//multiplayer.animationInterval = setInterval(multiplayer.tickLoop, game.animationTimeout);
        if (multiplayer.dataChannel && multiplayer.dataChannel.readyState === 'open') {    // in case other side disconnects
            Asteroids.startGame();
        } else {
            // Other side has disconnected so go straight back to title screen
            $("#gameMessage").hide();
            multiplayer.closeAndExit();
        }
	},

	// Tell the server that the player has lost
	loseGame: function() {
    	multiplayer.sendWebSocketMessage({type: "lose_game", roomId: multiplayer.roomId});
	},
	endGame: function(reason) {
    	delete multiplayer.roomId;
    	$('#multiplayergameslist').prop('disabled', false);
        $('#multiplayerjoin').prop('disabled', false);
	},

    ////////////////////////////////////////////////
    /// WebRTC functions
    ////////////////////////////////////////////////

    // call start(true) to initiate
    startSignal: function(isInitiator) {
        multiplayer.rtcPeerConn = new RTCPeerConnection(multiplayer.configuration);

        // send any ice candidates to the other peer
        multiplayer.rtcPeerConn.onicecandidate = function (evt) {
            if (evt.candidate) {
                multiplayer.sendWebSocketMessage({type: "signal", candidate: evt.candidate });
            }
        };

        // let the "negotiationneeded" event trigger offer generation
        multiplayer.rtcPeerConn.onnegotiationneeded = function () {
            multiplayer.rtcPeerConn.createOffer().then(function (offer) {
                return multiplayer.rtcPeerConn.setLocalDescription(offer);
            })
            .then(function () {
                // send the offer to the other peer
                multiplayer.sendWebSocketMessage({type: "signal", desc: multiplayer.rtcPeerConn.localDescription });
            })
            .catch(multiplayer.onCreateSessionDescriptionError);
        };

        if (isInitiator) {
            // create data channel and setup comms
            multiplayer.dataChannel = multiplayer.rtcPeerConn.createDataChannel('textMessages', multiplayer.dataChannelOptions);
            multiplayer.dataChannel.onopen = multiplayer.dataChannelStateChanged;
        } else {
            // setup comms on incoming data channel
            multiplayer.rtcPeerConn.ondatachannel = function (evt) {
                multiplayer.dataChannel = evt.channel;
                multiplayer.dataChannel.onopen = multiplayer.dataChannelStateChanged;
                multiplayer.dataChannel.onclose = function() {console.log('Datachannel closed'); multiplayer.rtcPeerConn.close(); multiplayer.rtcPeerConn = null;};
            };
        }
    },
    onCreateSessionDescriptionError: function(error) {
        console.log(error.toString());
    },
    dataChannelStateChanged: function() {
        if (multiplayer.dataChannel.readyState === 'open') {
            multiplayer.dataChannel.onmessage = multiplayer.receiveDataChannelMessage;
            console.log("Success! Data channel open");
            multiplayer.initMPGameOnOpenDataChannel();
        } else {
            $("#connectingDataChannel").fadeIn('slow');
        }
    },

    initMPGameOnOpenDataChannel: function() {
        if (multiplayer.dataChannel && multiplayer.dataChannel.readyState === 'open') {
            multiplayer.sendDataChannelMessage({type:"handshake", message: 'Handshake message from ' + multiplayer.acronym, acronym: multiplayer.acronym});
            if (multiplayer.isInitiator) {
                multiplayer.measureLatency();
                multiplayer.finishMeasuringLatency();
                multiplayer.sendDataChannelMessage({type: "latency_result", latency: multiplayer.averageLatency});
            }
            $("#connectingDataChannel").hide();
            Asteroids.initGame('MULTIPLAYER IS ON!<BR>EACH PLAYER PRESS SPACE WHEN READY');
            multiplayer.sendWebSocketMessage({type: "chat", text: "starting game session"});
        } else {
            multiplayer.closeAndExit();
        }
    },

    receiveDataChannel: function(event) {
        multiplayer.dataChannel = event.channel;
        multiplayer.dataChannel.onmessage = multiplayer.receiveDataChannelMessage;
    },
    receiveDataChannelMessage: function(event) {
        // game commands here
        var messageObject = JSON.parse(event.data);
        //console.log('Received data channel message:', messageObject.type);
        switch (messageObject.type) {
            case "handshake":
                console.log('Received', messageObject.acronym);
                Asteroids.setPlayerRemoteAcronym(messageObject.acronym);
                if (multiplayer.isInitiator) {
                    Asteroids.resetGame();
                }
                break;
            case "latency_ping":
                multiplayer.sendDataChannelMessage({type: "latency_pong"});
                break;
            case "latency_pong":
                multiplayer.finishMeasuringLatency();
                // Measure latency at least thrice
                if (multiplayer.latencyTrips.length < 6) {
                    multiplayer.measureLatency();
                } else {
                    multiplayer.sendDataChannelMessage({type: "latency_result", latency: multiplayer.averageLatency});
                }
                break;
            case "latency_result":
                multiplayer.averageLatency = messageObject.latency;
                break;
            case "ready":
                multiplayer.peerReady = true;
                if(multiplayer.isInitiator && multiplayer.ready) {
                    multiplayer.sendDataChannelMessage({type: "start"});
                }
                break;
            case "start":
                if(!multiplayer.isInitiator) {
                    multiplayer.sendDataChannelMessage({type: "start"});
                }
                Asteroids.startGame();
                break;
            case "setup_asteroids":
                multiplayer.asteroidsArray = messageObject.asteroidsArray;
                multiplayer.asteroidTick = messageObject.asteroidTick;
                break;
            case "position":
                Asteroids.receivePosition(messageObject.position);
                break;
            case "command":
                Asteroids.receiveCommand(messageObject.command);
                break;
            case "gameover":
                Asteroids.setPlayerRemoteLost(messageObject.score, messageObject.time);
                Asteroids.setMessage();
                break;
            case "dc_chat":
                multiplayer.updateWebRTCChatLog(messageObject.from, messageObject.text);
                break;
            case "closedatachannel":
                multiplayer.closeDataChannel();
        }
    },
    sendDataChannelMessage: function(message) {
        if (multiplayer.dataChannel && multiplayer.dataChannel.readyState === 'open') {
            multiplayer.dataChannel.send(JSON.stringify(message));
        }
    },
    closeDataChannel: function() {
        if (multiplayer.dataChannel) {
            multiplayer.dataChannel.close();
        }
    },
    updateWebRTCChatLog: function(from, text) {
        var chatlogWebRTC = $("#chatlogWebRTC");
        $("#chatmessageslistWebRTC").append('<li>' + from + ': ' + text + '</li>');
        chatlogWebRTC.scrollTop(chatlogWebRTC[0].scrollHeight);
    },

    ///////////////////////////////////////////
    measureLatency: function() {
        var measurement = {start: Date.now()};
        multiplayer.latencyTrips.push(measurement);
        multiplayer.sendDataChannelMessage({type: "latency_ping"});
    },

    finishMeasuringLatency: function() {
        var measurement = multiplayer.latencyTrips[multiplayer.latencyTrips.length - 1];
        measurement.end = Date.now();
        measurement.roundTrip = measurement.end - measurement.start;
        multiplayer.averageLatency = 0;
        for (var i = 0; i < multiplayer.latencyTrips.length; i += 1) {
            multiplayer.averageLatency += measurement.roundTrip / 2;
        }
        multiplayer.averageLatency = multiplayer.averageLatency / multiplayer.latencyTrips.length;
        multiplayer.tickLag = Math.round(multiplayer.averageLatency * 2 / 100) + 1;
        console.log("Measuring Latency for player. Attempt", multiplayer.latencyTrips.length, "-Average Latency:", multiplayer.averageLatency, "Tick Lag:", multiplayer.tickLag);
    },
    ////////////////////////////////////////////
};
