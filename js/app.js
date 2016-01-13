CHARACTER_Y_OFFSET = 25; // offest used to position characters within the corresponding square when rendering
PLAYER_EDGE_OFFSET = 17; // the actual edge of the character from the edge of the square

// Enemies our player must avoid
var Enemy = function() {
    this.sprite = 'images/enemy-bug.png';

    // Randomly set the Enemy initial location and speed
    this.x = getRandomIntInclusive(1,100) * -101;
    this.y = (getRandomIntInclusive(1,3) * 83) - CHARACTER_Y_OFFSET;

    this.speed = getRandomIntInclusive(15,500);
};

/* Update the Enemy location and check collision with Player
 *  Parameter: dt, a time delta between ticks
 */
Enemy.prototype.update = function(dt) {

    this.x += this.speed * dt;

    if (player.hasCollided(this))
        player.reset();
};

// Draw the enemy on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
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


    //Initial locations used by reset
    this.initialX = 2 * 101;
    this.initialY = (5 * 83) - CHARACTER_Y_OFFSET;

    this.x = this.initialX;
    this.y = this.initialY;

};

/* Update Player depending on certain events
 * Parameter: dt, a time delta between ticks
 */
Player.prototype.update = function(dt) {
      //no changes currently needed on update
};

// Draw the player on the screen
Player.prototype.render = function() {
    if (selectingPlayer){
        var noticeGradient = ctx.createLinearGradient(0, ctx.canvas.height/2 - 40, 0, this.y+50);
        noticeGradient.addColorStop(0, 'white');
        noticeGradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = noticeGradient;
        ctx.fillRect(10, ctx.canvas.height/2 - 40, ctx.canvas.width-20, this.y+50);

        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = "bottom";
        ctx.fillStyle = 'black';
        ctx.lineWidth = 2;
        ctx.fillText('To pick your player type a number...',ctx.canvas.width/2, ctx.canvas.height/2);


        for (var i = 0; i < this.sprites.length; i++) {
            ctx.drawImage(Resources.get(this.sprites[i]), i*101 ,this.y);
            ctx.fillText(i+1, i*101 + 50, this.y + CHARACTER_Y_OFFSET);
        };
    }else{
        ctx.drawImage(Resources.get(this.sprites[this.currentSprite]), this.x, this.y);
    }
};

/* Handle user inputs for picking or controlling the player and game
 * while checking and reacting to boundary conditions of the
 * game play area
 */
Player.prototype.handleInput = function (key){
    if (!paused){
        switch (key){
            case 'left':
                if (this.x>= 101)    // allow left-move only if player is on 2nd column or greater
                    this.x -= 101;
                break;
            case 'up':
                if (this.y >= 83 - CHARACTER_Y_OFFSET) // allow up-move only if player is on 2nd row or greater
                    this.y -= 83;
                break;
            case 'right':
                if (this.x < 404)     // allow right-move only if player is on less than 5th column
                    this.x += 101;
                break;
            case 'down':
                if (this.y < this.initialY) // allow down-move only if player is on less than 6th row (currently 6th row == initialY)
                    this.y += 83;
                break;
            default:
                if (undefined != key && selectingPlayer) {
                    this.currentSprite = key-1; // if selecting player avatar, set the sprite
                    selectingPlayer = false;
                }

        }
        if (this.y <= 0)     // If player has hit water
            this.reset();
    }


};

//Resets player to initial location
Player.prototype.reset = function (){
    this.x = this.initialX;
    this.y = this.initialY;
};

// Enemies and other objects can check if they've collided with the player
Player.prototype.hasCollided = function(obj){
    return (obj.y == this.y && (Math.abs(this.x - obj.x) < 101 - PLAYER_EDGE_OFFSET));
};



// Instantiate globally available game Objects.
var selectingPlayer = true;
var paused = false;
var numEnemies = 50;
var allEnemies = [];

for (i=0;i<numEnemies;i++){
    allEnemies[i] = new Enemy();
}

var player = new Player();


/* This listens for key presses and sends the keys to your
 * Player.handleInput() method.
 * The values sent to the handleInput depends on if user
 * is selecting a player or actively playing the game
 */
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
            32: 'pause',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

    if (selectingPlayer) {
        allowedKeys = {
            49: 1,
            50: 2,
            51: 3,
            52: 4,
            53: 5
        };
    }

    if (allowedKeys[e.keyCode] != 'pause')
        player.handleInput(allowedKeys[e.keyCode]);
    else{
        paused = !paused;
    }
});

/* Returns a random integer between min (included) and max (included)
 * Using Math.round() will give you a non-uniform distribution!
 * From MDN example
 */
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
