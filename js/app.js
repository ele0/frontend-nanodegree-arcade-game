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

    if (player.collidesWith(this))
        player.reset();
};

// Draw the enemy on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


// Player that user controls
var Player = function() {
    this.sprite = 'images/char-boy.png';
    // TODO: Add ability for user to select type of sprite

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
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Handle user inputs for controlling the player
Player.prototype.handleInput = function (direction){
    switch (direction){
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
            this.reset(); // pressing any other key resets the player
    }
    if (this.y <= 0)     // If player has hit water
        this.reset();

};

//Resets player to initial location
Player.prototype.reset = function (){
    this.x = this.initialX;
    this.y = this.initialY;
};

// Enemies and other objects can check if they've collided with the player
Player.prototype.collidesWith = function(obj){
    return (obj.y == this.y && (Math.abs(this.x - obj.x) < 101 - PLAYER_EDGE_OFFSET));
};



// Instantiate globally available game Objects.
var numEnemies = 50;
var allEnemies = [];

for (i=0;i<numEnemies;i++){
    allEnemies[i] = new Enemy();
}

var player = new Player();


/* This listens for key presses and sends the keys to your
 * Player.handleInput() method. You don't need to modify this.
 */
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

/* Returns a random integer between min (included) and max (included)
 * Using Math.round() will give you a non-uniform distribution!
 * From MDN example
 */
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
