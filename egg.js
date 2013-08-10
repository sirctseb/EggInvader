// Object to represent the game state
var Game = function() {
	// the list of enemies
	this.enemies = [];
	this.NUM_ENEMIES = 5;
	// generate enemies
	for(var i = 0; i < this.NUM_ENEMIES; i++) {
		this.enemies.push(new Enemy());
	}
	this.lastTime = 0;
	this.mouseLocation = {};
	var this_ = this;
	var mouseUpdate = function(event) {
		this_.updateMouse(event);
	};
	document.addEventListener('mousemove', mouseUpdate);
};
Game.prototype.updateMouse = function(event) {
	// store mouse location
	this.mouseLocation.x = event.pageX;
	this.mouseLocation.y = event.pageY;
};
// update the game state
Game.prototype.update = function(time) {
	// calculate time since last update
	var delta = time - this.lastTime;
	// udpate enemies
	for(var i in this.enemies) {
		this.enemies[i].update(delta);
	}
	this.lastTime = time;
	var this_ = this;
	// window.requestAnimationFrame(function(time) {this_.update(time)});
};
var Health = function() {
	this.viewWidth = 200;
	this.value = 1;
	this.element = document.getElementById("health");
};
Health.prototype.reduce = function() {
	if(this.value > 0.5) {
		this.value -= 0.1;
	} else {
		this.value *= 0.66;
	}
};
Health.prototype.updateView = function() {
	this.element.style.width = Math.floor(this.viewWidth * this.value).toString() + 'px';
};

// Object to represent an enemy
var Enemy = function() {
	// location of enemy
	this.x = randLeft();
	this.y = randTop();
	this.width = 128;
	this.height = 128;
	this.radius = 48;
	// enemy view
	this.element = document.createElement('div');
	this.element.classList.add('enemy');
	// speed of enemy
	this.velocity = 0.3;
	// add view to body
	document.body.appendChild(this.element);
};
Enemy.prototype.update = function(delta) {
	// update location
	this.y += this.velocity*delta;
	// loop to top of screen when we go off the bottom
	if(this.y > window.innerHeight) {
		this.y = 0;
		this.x = randLeft();
	}
	// set style
	this.element.style.top = (this.y - this.height/2).toString() + 'px';
	this.element.style.left = (this.x - this.width/2).toString() + 'px';
};

// start the game
var startgame = function() {
	// create the game object
	var game = new Game();
	// TODO see if there is a better way to get a method callback
	window.requestAnimationFrame(function(time) {game.update(time)});
	// window.requestAnimationFrame(game.update);
};

// random numbers within window width/height
var randTop = function() {
	return Math.floor((Math.random()*window.innerHeight) + 1);
};
var randLeft = function() {
	return Math.floor((Math.random()*window.innerWidth) + 1);
};
