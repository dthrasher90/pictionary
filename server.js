
var http = require('http');
var express = require('express');
var socket_io = require('socket.io');
var engine = require('./game.js');

var gameEngine = new engine.GameEngine();

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);


io.on('connection', function(socket) {

    // send any new connections content
    // of drawList so they can catch up
    socket.emit('connected', gameEngine.drawList);

    // once user registers, emit gameChanged so
    // clients can update
    socket.on('regUser', function(nickName) {
        gameEngine.addPlayer(socket.id, nickName);
        io.emit('gameChanged', gameEngine.getGameInfo());
    });

    // when a user disconnects, remove user from game
    // and send out updated game information
    socket.on('disconnect', function() {
        gameEngine.removePlayer(socket.id);
        io.emit('gameChanged', gameEngine.getGameInfo());
    });

    socket.on('draw', function(position) {
        // log this for users that enter game and emit to connected users
        gameEngine.addDrawPosition(position);
        socket.broadcast.emit('draw', position);
    });

    socket.on('guess', function(guess) {

        // send guess
        var nickName = gameEngine.players[socket.id];
        var msg = nickName + ' guessed: ' + guess;
        io.emit('gameMsg', msg);

        // see if the guess is correct.  If so,
        // send system message, set new word,
        // and change drawer to the winner
        if (gameEngine.isGuessCorrect(guess)) {

            // send message about winner and make winner the drawer
            io.emit('gameMsg', nickName + ' was right!');
            gameEngine.setDrawer(socket.id);

            // clear drawlist and everyone's canvas
            gameEngine.clearDrawList();
            io.emit('clear');

            // change word
            gameEngine.setWord();

            // update players game state
            io.emit('gameChanged', gameEngine.getGameInfo());
        }
    });

    // when a clear event is sent from the drawer,
    // clear list of positions drawn and send
    // clear to connected users.
    socket.on('clear', function() {
        gameEngine.clearDrawList();
        socket.broadcast.emit('clear');
    });

});

server.listen(process.env.PORT || 2000);
