
/**
 * Created by tstuart on 6/1/15.
 */


// the game engine will do most of the heavy lifting for the server
var GameEngine = function() {

    // can add more words as needed and the randomizer should pick them up.
    // however, there is nothing to prevent words from being repeated.
    // That could be a future enhancement.
    this.WORDS = [
        "word", "letter", "number", "person", "pen", "class", "people",
        "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
        "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
        "land", "home", "hand", "house", "picture", "animal", "mother", "father",
        "brother", "sister", "world", "head", "page", "country", "question",
        "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
        "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
        "west", "child", "children", "example", "paper", "music", "river", "car",
        "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
        "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
        "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
        "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
        "space", "football"
    ];

    this.drawerID = null;           // keep track of current drawer by socket id
    this.players = new Object();    // keep list of currently connected players
    this.currentWord = null;        // keep track of current word to be guessed
    this.setWord();                 // on startup, set the current word
    this.drawList = [];             // keep track of drawlist of midstream connections

};

// add a player to the list.
GameEngine.prototype.addPlayer = function(id, nickName) {
    this.players[id] = nickName;

    // If the game does not have a current drawer, make this
    // player the drawer
    if (!this.drawerID) {
        this.drawerID = id;
    }
};

// remove a player from list.  Accommodate drawer disconnecting
GameEngine.prototype.removePlayer = function(id) {
    if (!this.players[id]) {
        return;
    }

    delete this.players[id];

    // check to see if it was the drawer that is being removed
    // if so (and there is still more
    if (id === this.drawerID) {

        if (Object.keys(this.players).length > 0) {
            // make the first object the drawer
            for(var index in this.players) {
                this.drawerID = index;
                break;
            }

        } else {
            // out of players, set drawerID to null
            this.drawerID = null;
        }
    }
};

// after someone guesses correctly, we need to change drawers.
// this will allow for this.
GameEngine.prototype.setDrawer = function(id) {
    this.drawerID = id;
};

// Select a random word and set as current word.
GameEngine.prototype.setWord = function() {
    // get a random index for the word array
    var rndNum = Math.floor((Math.random() * (this.WORDS.length - 1)));
    this.currentWord = this.WORDS[rndNum];
};

// add positions to draw list so clients connecting midstream can
// get current drawing
GameEngine.prototype.addDrawPosition = function(position) {
    this.drawList.push(position);
};

// clear drawlist (should happen on a winner and when
// drawer clears his/her canvas)
GameEngine.prototype.clearDrawList = function() {
    this.drawList = [];
};

// return needed game information for client use
GameEngine.prototype.getGameInfo = function() {
    return {
        drawerID: this.drawerID,
        currentWord: this.currentWord,
        players: this.players
    }
};

// check guess against current word
GameEngine.prototype.isGuessCorrect = function(guess) {
    return (this.currentWord.toUpperCase() === guess.toUpperCase())
};

exports.GameEngine = GameEngine;
