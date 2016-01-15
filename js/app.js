// global variable to hold all global properties within this file
var app = app || {};

// Constants to use when rendering objects
app.CHARACTER_Y_OFFSET = 25; // offest used to position characters within the corresponding square when rendering
app.PLAYER_EDGE_OFFSET = 17; // the actual edge of the character from the edge of the square

// Enemies our player must avoid
var Enemy = function() {
    this.sprite = 'images/enemy-bug.png';

    //setup initial state
    this.reset();
};

/* Update the Enemy state e.g. location
 * Parameter: dt, a time delta between ticks
 */
Enemy.prototype.update = function(dt) {
    this.x += this.speed * dt;
};

// Draw the enemy on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Set enemy to state as if it was just created
Enemy.prototype.reset = function() {
    // set location and speed to random values within acceptable thresholds
    this.x = getRandomIntInclusive(1, 100) * -101;
    this.y = (getRandomIntInclusive(1, 3) * 83) - app.CHARACTER_Y_OFFSET;

    this.speed = getRandomIntInclusive(15, 500);
};


// Player that user controls
var Player = function() {
    this.sprites = ['images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ];
    this.currentSprite = 1;

    this.livesLeft = 3;
    this.score = 0;

    //Initial locations used by reset
    this.initialX = 2 * 101;
    this.initialY = (5 * 83) - app.CHARACTER_Y_OFFSET;

    this.x = this.initialX;
    this.y = this.initialY;

};

/* Update Player and respond to state of player depending on certain
 * events e.g. if no more lives left. Parameter: dt, a time delta between ticks
 */
Player.prototype.update = function(dt) {
    if (this.livesLeft <= 0) {
        app.gameOver = true;
        app.paused = true;
    }
};

// Draw the player and related artifacts on the screen
Player.prototype.render = function() {

    ctx.font = '26px sans-serif';
    // clear top bar and previous drawn state of indicators
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, 50);


    if (app.selectingPlayer) {
        // Create a lighter background to write instructions on for better contrast
        var noticeGradient = ctx.createLinearGradient(0, ctx.canvas.height / 2 - 40, 0, this.y + 50);
        noticeGradient.addColorStop(0, 'white');
        noticeGradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = noticeGradient;
        ctx.fillRect(10, ctx.canvas.height / 2 - 40, ctx.canvas.width - 20, this.y + 50);

        //setup and write instructions
        ctx.textAlign = 'center';
        ctx.textBaseline = "bottom";
        ctx.fillStyle = 'black';
        ctx.lineWidth = 2;
        ctx.fillText('To pick your player type a number...', ctx.canvas.width / 2, ctx.canvas.height / 2);

        //Draw sprites in a row for user to choose from
        for (var i = 0, len = this.sprites.length; i < len; i++) {
            ctx.drawImage(Resources.get(this.sprites[i]), i * 101, this.y);
            ctx.fillText(i + 1, i * 101 + 50, this.y + app.CHARACTER_Y_OFFSET);
        }
    } else {

        // draw indicator for number of lives and score
        ctx.textAlign = 'left';
        ctx.textBaseline = "top";
        ctx.fillStyle = 'red';
        ctx.fillText(String.fromCharCode(0x2665), 5, 20);
        ctx.fillStyle = 'black';
        ctx.fillText(('x' + this.livesLeft), 32, 20);
        //draw current score indicator
        ctx.textAlign = 'right';
        ctx.fillText(this.score, ctx.canvas.width - 10, 20);

        ctx.drawImage(Resources.get(this.sprites[this.currentSprite]), this.x, this.y);
    }
};

/* Handle user inputs for picking or controlling the player
 * while checking and reacting to boundary conditions of the
 * game play area
 */
Player.prototype.handleInput = function(key) {
    if (!app.paused && key !== undefined) {
        switch (key) {
            case 'left':
                if (this.x >= 101) // allow left-move only if player is on 2nd column or greater
                    this.x -= 101;
                break;
            case 'up':
                if (this.y >= 83 - app.CHARACTER_Y_OFFSET) // allow up-move only if player is on 2nd row or greater
                    this.y -= 83;
                break;
            case 'right':
                if (this.x < 404) // allow right-move only if player is on less than 5th column
                    this.x += 101;
                break;
            case 'down':
                if (this.y < this.initialY) // allow down-move only if player is on less than 6th row (currently 6th row == initialY)
                    this.y += 83;
                break;
            default:
                if (app.selectingPlayer) {
                    this.currentSprite = key - 1; // if selecting player avatar, set the sprite
                    app.selectingPlayer = false;
                }

        }
        if (this.y <= 0) { // If player has hit water
            this.score++;
            this.reset();
        }
    }

};

//Resets player to initial location and if gameOver, all it's state
Player.prototype.reset = function() {
    this.x = this.initialX;
    this.y = this.initialY;

    if (app.gameOver) {
        this.livesLeft = 3;
        this.score = 0;
    }
};

/* Player can check if it has collided with any objects which is currently
 * defined as if at the same height and overlapping each other in anyway
 * horizontally
 */
Player.prototype.hasCollided = function(obj) {
    return (obj.y == this.y && (Math.abs(this.x - obj.x) < 101 - app.PLAYER_EDGE_OFFSET));
};

// Player checks for and handles different types of collisions
// when given an object
Player.prototype.checkCollision = function(obj) {
    if (this.hasCollided(obj) && obj instanceof Enemy) {
        this.livesLeft--;
        this.reset();
    }
};


// Instantiate globally available game Objects.
app.selectingPlayer = true;
app.paused = false;
app.gameOver = false;
app.numEnemies = 50;
app.allEnemies = [];

for (i = 0; i < app.numEnemies; i++) {
    app.allEnemies[i] = new Enemy();
}

app.player = new Player();

/* This listens for key presses and sends the keys to Player.handleInput() method.
 * The values sent to the handleInput depends on if user is selecting a player or
 * actively playing the game
 */
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        32: 'pause',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    if (app.selectingPlayer) {
        allowedKeys = {
            49: 1,
            50: 2,
            51: 3,
            52: 4,
            53: 5
        };
    }

    //pass input to player if not pause key
    return allowedKeys[e.keyCode] == 'pause' ? app.paused = !app.paused : app.player.handleInput(allowedKeys[e.keyCode]);

});

/* Returns a random integer between min (included) and max (included)
 * Using Math.round() will give you a non-uniform distribution!
 * From MDN example
 */
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
