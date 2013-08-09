var startgame = function() {
	// set random positions for enemies
	var enemies = document.getElementsByClassName('enemy');
	for(var elindex = 0; elindex < enemies.length; elindex++) {
		enemies[elindex].style.top = randTop().toString() + 'px';
		console.log(randTop());
		enemies[elindex].style.left = randLeft().toString() + 'px';
	}
};

var randTop = function() {
	return Math.floor((Math.random()*window.innerHeight) + 1);
};
var randLeft = function() {
	return Math.floor((Math.random()*window.innerWidth) + 1);
};