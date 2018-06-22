
var twitchIRC = function (username, oauth, options) {
    "use strict";
    var nick = username,
        auth = 'oauth:' + oauth,
        options = options || [],
        AutoRejoin = options.AutoRejoin || true,
        channels = options.channels || [],
        channelsConnected = channels,
        triggers = {},
        ws;


    // Can Websockets work
    if (!("WebSocket" in window)) {
        // The browser doesn't support WebSocket
        throw {
            name: "Web Sockets Unsupported",
            message: "Your browser does not support web sockets! Please update your browser!"
        };
    }

    // Tools
    function is_array(array) {
        // Check the array is an object
        return typeof array === "object";
    }
    function indexOf(array, find) {
        var i;
        // Confirm that the array exists and it is an array
        if (array === "undefined" || !is_array(array)) {
            return false;
        }
        // Search the array
        for (i = 0; i < array.length; i++) {
            // If it is what you are looking for return the position
            if (array[i] === find) {
                return i;
            }
        }
        // If it is not found return -1
        return -1;
    }

    // Events
    function on (event, callback) {
        if (!triggers[event]) {
            triggers[event] = [];
        }
        triggers[event].push(callback);
    }
    this.on = on;
    function fire (event, params) {
        var i;
        if (triggers[event]) {
            for (i in triggers[event]) {
                triggers[event][i].apply(null, Array.prototype.slice.call(arguments, 1));
            }
        }
    }

    // Let us open a web socket
    ws = new ReconnectingWebSocket("wss://irc-ws.chat.twitch.tv/");

    // Main join, part & messageing functions
    function join (channel) {
        // Remove trailing spaces
        channel = channel.trim();

        // Add the '#' if in infront of channel
        if (channel.substr(0, 1) !== "#") {
            channel = "#" + channel;
        }

        // Send the command
        ws.send("JOIN " + channel);
    }
    this.join = join;
    function part (channel) {
        // Remove trailing spaces
        channel = channel.trim();

        // Add the '#' if in infront of channel
        if (channel.substr(0, 1) !== "#") {
            channel = "#" + channel;
        }

        // Send the command
        ws.send("PART " + channel);
    }
    this.part = part;
    function msg (channel, message) {
        // Remove trailing spaces
        channel = channel.trim();

        // Add the '#' if in infront of channel
        if (channel.substr(0, 1) !== "#") {
            channel = "#" + channel;
        }

        // Send the command
        ws.send("PRIVMSG " + channel + " :" +message);
    }
    this.msg = msg;
    function whisperTo (user, message) {
        // Remove trailing spaces
        user = user.trim();

        // Send the command
        ws.send("PRIVMSG #jtv :/w " + user + " " + message);
    }
    this.whisper = whisperTo;

    // On connection log in
    ws.onopen = function () {
        var i;
        // Web Socket is connected, send data using send()
        ws.send('PASS ' + auth);
        ws.send('NICK ' + nick);

        // Request all capibilities
        ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');

        // Join initial channels
        for (i in channels) {
            // Check the channel is not lost
            if (channels.hasOwnProperty(i)) {
                // Join the channel
                join(channels[i]);
            }
        }
    };
    // Parse all messages
    ws.onmessage = function (evt) {
        //console.log(evt.data);
        // Collect the message from the event
        var messages = evt.data,
            // Split the message to single lines
            messages = messages.trim().split("\n"),
            // Declare the rest of the used variables
            i, array, message, tags;

        // Loop through all possible lines
        for (i in messages) {
            // Check the line is still there
            if (messages.hasOwnProperty(i)) {
                // Emit the "raw" event
                fire("raw", messages[i].trim())

                // Split the line down into tags, host, command, channel & message
                array = /(?:@([^ ]*) )?:([a-zA-z0-9!@_.]+) ([A-Z0-9]+) ([^ \r\n]+)(?:(?: :)?(.*))?/g.exec(messages[i].trim());

                // If the regex worked
                if (array !== null) {
                    // Construct the 'constants' in a message
                    message = {
                        'host': array[2],
                        'command': array[3],
                        'channel': array[4],
                        'raw': messages[i].trim()
                    };

                    // If the message has tags
                    if (typeof array[1] !== "undefined") {
                        // Create a place to store the tags
                        tags = {};
                        // Split the tags into individual tags
                        array[1] = array[1].split(";");

                        // Go through every tag
                        for (i in array[1]) {
                            // Check that the tag is there
                            if (array[1].hasOwnProperty(i)) {
                                // Open the tag's key and value
                                array[1][i] = array[1][i].split("=");

                                // Assign the value to the correct key and add to tags array
                                tags[array[1][i][0]] = array[1][i][1];
                            }
                        }

                        // Add tags to the message array
                        message.tags = tags;
                    }

                    // If there is a message put it in the array
                    if (typeof array[5] !== "undefined") {
                        if (/\u0001ACTION (.*)\u0001/.test(array[5])) {
                            message.action = true;
                            message.message = /\u0001ACTION (.*)\u0001/.exec(array[5])[1];
                        } else {
                            message.action = false;
                            message.message = array[5];
                        }
                    }

                    // Pull usernames from host
                    if (/(?:(.+)!\1@\1\.)tmi.twitch.tv/.test(message.host)) {
                        message.user = /(?:(.+)!\1@\1\.)tmi.twitch.tv/.exec(message.host)[1];
                    }
                } else {
                    // Check to see if is a PING
                    if (messages[i].trim() === "PING :tmi.twitch.tv") {
                        // Respond to PING
                        ws.send("PONG :tmi.twitch.tv");
                        // Give a nicer message
                        message = "PING - PONG";
                    }

                }

                // Emit the "join" event
                if (message === undefined) {
                    console.log(evt.data);
                    continue;
                }
                else if (message.command === "JOIN") {
                    fire("join", message.channel, message.user);
                }
                // Emit the "part" event
                else if (message.command === "PART") {
                    fire("part", message.channel, message.user);
                }
                // Emit the "message" event
                else if (message.command === "PRIVMSG" && message.action !== true) {
                    fire("message", message.channel, message.user, message.message, message);
                }
                // Sub notifications
                else if (message.command === "USERNOTICE") {
                    fire("subscribe", message.channel, message.user, message.message, message);
                }
                // Host notifications
                else if (message.command === "HOSTTARGET") {
                    fire("host", message.channel, message.user, message.message, message);
                }
                // Emit the "message" event
                else if (message.command === "PRIVMSG" && message.action === true) {
                    fire("action", message.channel, message.user, message.message);
                }
                // NOTICE messages, mod list
                else if (message.command === "NOTICE") {
                    fire("notice", message.channel, message.user, message.message, message);
                }
                // WHISPER messages
                else if (message.command === "WHISPER") {
                    fire("whisper", message.user, message.message, message);
                }
            }
        }
    };

    ws.onclose = function () {
        // Websocket is closed.
        console.log("Connection is closed...");
        // If autorejoining is needed
    };
    function closeConnection () {
        ws.close();
    }
    this.closeConnection = closeConnection;
};
