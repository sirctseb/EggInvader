(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
// Object to represent the game state
var Game = function() {
	// the list of enemies
	this.enemies = [];
	// the list of projectiles
	this.projectiles = [];
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
	this.eggWrapperDiv = document.getElementById("egg-wrapper");
	this.eggHit = false;
	this.endGame = false;
	// min time between collisions in ms
	this.COLLISION_REFRACTORY_TIME = 1000;
	var this_ = this;
	this_.mouseUpdate = function(event) {
		this_.updateMouse(event);
	};
	document.addEventListener('mousemove', this_.mouseUpdate);
	document.addEventListener('touchmove', function(tchevt) {
		tchevt.preventDefault();
		// pass a higher position so you can see it
		this_.updateMouse({pageX: tchevt.touches[0].pageX, pageY: tchevt.touches[0].pageY - 150});
		// check if touch is over egg
		var x = tchevt.touches[0].pageX - this_.eggWrapperDiv.offsetLeft;
		var y = tchevt.touches[0].pageY - this_.eggWrapperDiv.offsetTop - 100;
		if(x < this_.eggWrapperDiv.offsetWidth && y < this_.eggWrapperDiv.offsetHeight) {
			overEggFunction();
		}
	});
	window.setTimeout(
		function() {
			document.getElementById('transition-message').classList.add('transition');
			window.setTimeout(
				function() {
					document.getElementById('transition-message').classList.remove('transition');
				}, Game.DISPLAY_TIME);
		},
		Game.TRANSITION_TEXT_TIME);

	window.setTimeout(function() {this_.transition();}, Game.TRANSITION_TIME);
	var overEggFunction = function() {
		this_.overEggHandler();
	};
	document.getElementById('egg').addEventListener('mouseover', overEggFunction);

	// mouse click handler
	var handleClick = function(event) {
		// create a projectile
		var projectile = new Projectile({x: event.pageX, y: event.pageY});
		this_.projectiles.push(projectile);
	};
	document.documentElement.addEventListener('mousedown', handleClick);
	document.documentElement.addEventListener('touchstart', function(tchevent) {
		// also do a mouse update
		this_.updateMouse({pageX: tchevent.touches[0].pageX, pageY: tchevent.touches[0].pageY - 150});
		tchevent.preventDefault();
		handleClick(tchevent.touches[0]);
	});
	document.documentElement.addEventListener('dblclick', function(event) {
		event.preventDefault();
	});
};
// the time in ms until the transition to baby theme
Game.TRANSITION_TIME = 30000;
Game.TRANSITION_TEXT_TIME = Game.TRANSITION_TIME - 2000;
Game.DISPLAY_TIME = 3000;
Game.DUE_DATE_DELAY = 10000;
Game.prototype.transition = function() {
	Enemy.respawnTypes = ['pacifier', 'bottle'];
	this.cursorImageDiv.classList.add('sperm');
	this.eggWrapperDiv.classList.add('transition');
	// if we haven't moved into the egg after the transition time, force it
	var this_ = this;
	window.setTimeout(function() {
		if(!this_.eggHit) {
			this_.overEggHandler();
		}
	}, 10000); // 10 seconds from css
};
Game.prototype.updateMouse = function(event) {
	// store mouse location
	this.mouseLocation.x = event.pageX;
	this.mouseLocation.y = event.pageY;
	// update cursor image location
	this.cursorImageDiv.style.left = '' + (event.pageX - 48) + 'px';
	this.cursorImageDiv.style.top = '' + (event.pageY - 64) + 'px';
};
Game.prototype.overEggHandler = function(event) {
	var this_ = this;
	if(this_.eggHit) return;
	this_.eggHit = true;
	// add hit to egg wrapper to start final animation
	this_.eggWrapperDiv.classList.add('hit');
	document.getElementById('egg').classList.add('showMonster');
	// stop moving the cursor image over the cursor
	document.removeEventListener('mousemove', this_.mouseUpdate);
	// add hit class to html to show normal cursor
	document.documentElement.classList.add('hit');
		this_.cursorImageDiv.classList.add('hit');
	this_.cursorImageDiv.style.top = '50%';
	this_.cursorImageDiv.style.left = '50%';
	// this_.cursorImageDiv.classList.add('prehit');
	// window.setTimeout(function() {
	// }, 1);
	if(!this_.endGame) {
		for(var i = 0; i < this_.NUM_ENEMIES; i++){
			this_.enemies[i].element.parentNode.removeChild(this_.enemies[i].element);
		}
	}
	this_.endGame = true;
	window.setTimeout(function() {
		document.getElementById('transition-message').innerHTML = 'Touchdown expected 2014-3-25';
		document.getElementById('transition-message').classList.add('transition');
	},
	Game.DUE_DATE_DELAY);
};
// update the game state
Game.prototype.update = function(time) {
	// calculate time since last update
	var delta = time - this.lastTime;
	// udpate enemies
	for(var i in this.enemies) {
		this.enemies[i].update(delta);
		if(!this.recentCollision && this.enemies[i].checkCollision(this.mouseLocation)) {
			document.getElementById('cursor').classList.add('damage');
			this.health.reduce();
			this.recentCollision = true;
			// TODO visual feedback on rocket during refractory period
			// TODO visual feedback on rocket on collision
			// TODO visual feedback on enemy on collision
			// TODO auditory feedback on collision
			var this_ = this;
			window.setTimeout(function() {
				document.getElementById('cursor').classList.remove('damage');
				this_.recentCollision = false;
			}, this.COLLISION_REFRACTORY_TIME);
		}
		// check for collisions with projectiles
		for(var j in this.projectiles) {
			if(this.enemies[i].checkCollision(this.projectiles[j])) {
				// reset the enemy
				this.enemies[i].reset();

				// destroy the projectile
				this.projectiles[j].destroy();
				this.projectiles.splice(this.projectiles.indexOf(this.projectiles[j]), 1);
			}
		}
	}
	// update projectiles
	var destroyed = [];
	for(var i in this.projectiles) {
		if(this.projectiles[i].update(delta)) {
			destroyed.push(this.projectiles[i]);
		}
	}
	for(var i in destroyed) {
		this.projectiles.splice(this.projectiles.indexOf(destroyed[i]), 1);
	}
	this.lastTime = time;
	var this_ = this;
	if(!this.endGame){
		window.requestAnimationFrame(function(time) {this_.update(time)});	
	}
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
		this.reset();
	}
	this.updateLocationStyle();
};
Enemy.prototype.updateLocationStyle = function() {
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
Enemy.prototype.reset = function() {
	this.y = 0;
	this.x = randLeft();
	this.updateLocationStyle();
	this.setType(Enemy.respawnTypes[Math.floor(Math.random()*2)]);
};

var Projectile = function(location) {
	// set initial location
	this.x = location.x;
	this.y = location.y;

	// create dom element
	this.element = document.createElement('div')
	this.element.classList.add('projectile');
	document.body.appendChild(this.element);
	this.element.style.left = this.x + 'px';
	this.element.style.top = this.y + 'px';

	this.velocity = 1;
};
/**
 * returns true if projectile is destroyed by update
 */
Projectile.prototype.update = function(delta) {
	this.y -= this.velocity * delta;
	this.element.style.top = this.y + 'px';
	if(this.y < 0) {
		this.destroy();
		return true;
	}
	return false;
};
Projectile.prototype.destroy = function() {
	document.body.removeChild(this.element);
	this.element = null;
};

// start the game
var startgame = function() {
	// create the game object
	var game = new Game();
	// TODO see if there is a better way to get a method callback
	if(!window.requestAnimationFrame) {
		window.requestAnimationFrame = window.webkitRequestAnimationFrame;
	}
	window.requestAnimationFrame(function(time) {game.lastTime = time; game.update(time)});
};

// random numbers within window width/height
var randTop = function() {
	return Math.floor((Math.random()*window.innerHeight) + 1);
};
var randLeft = function() {
	return Math.floor((Math.random()*window.innerWidth) + 1);
};

(function () {

if (typeof window.Element === "undefined" || "classList" in document.documentElement) return;

var prototype = Array.prototype,
    indexOf = prototype.indexOf,
    slice = prototype.slice,
    push = prototype.push,
    splice = prototype.splice,
    join = prototype.join;

function DOMTokenList(el) {  
  this._element = el;
  if (el.className != this._classCache) {
    this._classCache = el.className;

    if (!this._classCache) return;
    
      // The className needs to be trimmed and split on whitespace
      // to retrieve a list of classes.
      var classes = this._classCache.replace(/^\s+|\s+$/g,'').split(/\s+/),
        i;
    for (i = 0; i < classes.length; i++) {
      push.call(this, classes[i]);
    }
  }
};

function setToClassName(el, classes) {
  el.className = classes.join(' ');
}

DOMTokenList.prototype = {
  add: function(token) {
    if(this.contains(token)) return;
    push.call(this, token);
    setToClassName(this._element, slice.call(this, 0));
  },
  contains: function(token) {
    return indexOf.call(this, token) !== -1;
  },
  item: function(index) {
    return this[index] || null;
  },
  remove: function(token) {
    var i = indexOf.call(this, token);
     if (i === -1) {
       return;
     }
    splice.call(this, i, 1);
    setToClassName(this._element, slice.call(this, 0));
  },
  toString: function() {
    return join.call(this, ' ');
  },
  toggle: function(token) {
    if (!this.contains(token)) {
      this.add(token);
    } else {
      this.remove(token);
    }

    return this.contains(token);
  }
};

window.DOMTokenList = DOMTokenList;

function defineElementGetter (obj, prop, getter) {
	if (Object.defineProperty) {
		Object.defineProperty(obj, prop,{
			get : getter
		})
	} else {					
		obj.__defineGetter__(prop, getter);
	}
}

defineElementGetter(Element.prototype, 'classList', function () {
  return new DOMTokenList(this);			
});

})();
