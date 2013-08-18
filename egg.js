// Object to represent the game state
var Game = function() {
	// the list of enemies
	this.enemies = [];
	this.NUM_ENEMIES = 5;
	// generate enemies
	for(var i = 0; i < this.NUM_ENEMIES; i++) {
		this.enemies.push(new Enemy({'type': 'asteroid'}));
	}
	this.lastTime = 0;
	this.mouseLocation = {};
	this.health = new Health();
	this.recentCollision = false;
	this.cursorImageDiv = document.getElementById("cursor");
	// min time between collisions in ms
	this.COLLISION_REFRACTORY_TIME = 1000;
	var this_ = this;
	var mouseUpdate = function(event) {
		this_.updateMouse(event);
	};
	document.addEventListener('mousemove', mouseUpdate);
	window.setTimeout(function() {this_.transition();}, Game.TRANSITION_TIME);
};
// the time in ms until the transition to baby theme
Game.TRANSITION_TIME = 5000;
Game.prototype.transition = function() {
	console.log('hiiiiii!');
	Enemy.respawnTypes = ['pacifier', 'bottle'];
};
Game.prototype.updateMouse = function(event) {
	// store mouse location
	this.mouseLocation.x = event.pageX;
	this.mouseLocation.y = event.pageY;
	// update cursor image location
	this.cursorImageDiv.style.left = '' + (event.pageX - 48) + 'px';
	this.cursorImageDiv.style.top = '' + (event.pageY - 64) + 'px';
};
// update the game state
Game.prototype.update = function(time) {
	// calculate time since last update
	var delta = time - this.lastTime;
	// udpate enemies
	for(var i in this.enemies) {
		this.enemies[i].update(delta);
		if(!this.recentCollision && this.enemies[i].checkCollision(this.mouseLocation)) {
			this.health.reduce();
			this.recentCollision = true;
			// TODO visual feedback on rocket during refractory period
			// TODO visual feedback on rocket on collision
			// TODO visual feedback on enemy on collision
			// TODO auditory feedback on collision
			var this_ = this;
			window.setTimeout(function() {
				this_.recentCollision = false;
			}, this.COLLISION_REFRACTORY_TIME);
		}
	}
	this.lastTime = time;
	var this_ = this;
	window.requestAnimationFrame(function(time) {this_.update(time)});
};
var Health = function() {
	this.viewWidth = 200;
	this.value = 1;
	this.element = document.getElementById("health");
	this.REDUCTION_FRACTION = 0.8;
};
Health.prototype.reduce = function() {
	if(this.value > 0.5) {
		this.value -= 0.05;
	} else {
		this.value *= this.REDUCTION_FRACTION;
	}
	this.updateView();
};
Health.prototype.updateView = function() {
	this.element.style.width = Math.floor(this.viewWidth * this.value).toString() + 'px';
};

// Object to represent an enemy
var Enemy = function(options) {
	// location of enemy
	this.x = randLeft();
	this.y = randTop();
	// TODO customize radius for different types
	this.radius = 48;
	// enemy view
	this.element = document.createElement('div');
	this.element.classList.add('enemy');
	this.setType(options.type);
	// speed of enemy
	this.velocity = 0.3;
	// add view to body
	document.body.appendChild(this.element);
};
Enemy.types = {
	'star': {width: 128, height: 144},
	'asteroid': {width: 128, height: 128},
	'bottle': {width: 58, height: 128},
	'pacifier': {width: 128, height: 106}
};
// the types to choose from on respawn
Enemy.respawnTypes = ['star', 'asteroid'];
Enemy.prototype.setType = function(type) {
	// make specific type
	this.type = type;
	this.width = Enemy.types[type].width;
	this.height = Enemy.types[type].height;
	this.updateViewType();
};
Enemy.prototype.updateViewType = function() {
	this.element.style.width = '' + this.width + 'px';
	this.element.style.height = '' + this.height + 'px';
	this.element.style.backgroundImage = 'url(images/' + this.type + '.png)';
};
Enemy.prototype.update = function(delta) {
	// update location
	this.y += this.velocity*delta;
	// loop to top of screen when we go off the bottom
	if(this.y > window.innerHeight) {
		this.y = 0;
		this.x = randLeft();
		this.setType(Enemy.respawnTypes[Math.floor(Math.random()*2)]);
	}
	// set style
	this.element.style.top = (this.y - this.height/2).toString() + 'px';
	this.element.style.left = (this.x - this.width/2).toString() + 'px';
};
Enemy.prototype.checkCollision = function(mouseLocation) {
	var CURSOR_RADIUS = 48;
	if(this.distSq(mouseLocation) < Math.pow(this.radius + CURSOR_RADIUS,2)) {
		return true;
	}
};
Enemy.prototype.distSq = function(location) {
	return Math.pow(this.x - location.x,2) + Math.pow(this.y - location.y,2);
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
