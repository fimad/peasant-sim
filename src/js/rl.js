goog.provide('rl');
goog.require('rl.map');
goog.require('rl.view');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');


/** @const {number} */
rl.MAX_HP = 13;


/** @const {number} */
rl.MAX_BREAD = 800;


/** @const {number} */
rl.BREAD_SLICE = rl.MAX_BREAD / 5;


/** @const {number} */
rl.BREAD_FILL_UP = 2;


/** @const {number} */
rl.STEPS_PER_STATE = 5;


/** @const {string} */
rl.GAME_OVER_STARVED = 'dead_starved';


/** @const {string} */
rl.GAME_OVER_EATEN = 'dead_eaten';


/** @typedef {{
 *  name: string,
 *  color: string
 * }} */
rl.HungerState;


/** @type {Array.<rl.HungerState>} */
rl.hungerStates = [
  {name: 'sated', color: '#FFF'},
  {name: 'content', color: '#FFF'},
  {name: 'peckish', color: '#FFF'},
  {name: 'hungry', color: '#FFF'},
  {name: 'hungry!', color: '#FFEA8C'},
  {name: 'STARVING!', color: '#FF0000'}
];


/** Called on page load to set up the initial handlers and DOM. */
rl.init = function() {
  rl.view.init();
  rl.intro();
}


/**
 * Cycles through the slides in the message box and begins the game once the
 * slides have run out.
 */
rl.intro = function() {
  goog.events.removeAll(window);

  // Display the world in the background.
  var world = rl.map.newWorld();
  rl.view.setCellGenerator(world)

  goog.events.listen(window, goog.events.EventType.KEYDOWN, function(e) {
    if (e.keyCode != goog.events.KeyCodes.SPACE) {
      return;
    }

    var i = 0;
    var message = goog.dom.getElement('message');
    var slides = goog.dom.getChildren(message);
    for (i = 0; i < slides.length - 1; i++) {
      if (!goog.dom.classes.has(slides[i], 'hidden')) {
        goog.dom.classes.add(slides[i], 'hidden');
        goog.dom.classes.remove(slides[i + 1], 'hidden');
        break;
      }
    }

    // Begin the game if there are no slides left...
    if (i == slides.length - 1) {
      goog.dom.classes.add(slides[slides.length - 1], 'hidden');
      goog.dom.classes.add(message, 'hidden');
      rl.newGame(world);
    }
  });
}

/**
 *
 */
rl.newGame = function(world) {
  var x = 0;
  var y = 0;
  var hp = rl.MAX_HP;
  var bread = rl.MAX_BREAD;
  var score = 0;
  var state = 0;
  var stateSteps = 0;
  var gameOver = '';

  // Replace the cell generator with one that displays the current user.
  rl.view.setCellGenerator(function(dx, dy) {
    if (dx == 0 && dy == 0) {
      return {text: '@', color: '#FFF'};
    }
    return world(x + dx, y + dy);
  })
  rl.updateStatus(hp, bread, state, score);

  goog.events.removeAll(window);
  goog.events.listen(window, goog.events.EventType.KEYDOWN, function(e) {
    var newX = x, newY = y;
    var step = true;

    switch (e.keyCode) {
      case goog.events.KeyCodes.H:
      case goog.events.KeyCodes.LEFT:
        newX--; break;
      case goog.events.KeyCodes.J:
      case goog.events.KeyCodes.DOWN:
        newY++; break;
      case goog.events.KeyCodes.K:
      case goog.events.KeyCodes.UP:
        newY--; break;
      case goog.events.KeyCodes.L:
      case goog.events.KeyCodes.RIGHT:
        newX++; break;
      case goog.events.KeyCodes.SPACE:
        if (bread > 0) {
          state = Math.max(0, state - rl.BREAD_FILL_UP);
          bread -= rl.BREAD_SLICE;
        }
        break;
      default:
        step = false;
    }

    // Ignore non-control key strokes.
    if (!step) {
      return;
    }

    score++;
    stateSteps++;

    if (stateSteps >= rl.STEPS_PER_STATE) {
      stateSteps = 0;
      state++;
      if (state == rl.hungerStates.length) {
        state--;
        gameOver = rl.GAME_OVER_STARVED;
      }
    }

    var newCell = world(newX, newY);
    if (newCell.walkable) {
      x = newX;
      y = newY;
    }

    rl.updateStatus(hp, bread, state, score);
    rl.view.redraw();

    if (gameOver != '') {
      rl.gameOver(gameOver);
    }
  });
}


/** Updates the in game status bar. */
rl.updateStatus = function(hp, bread, state, score) {
  var hunger = rl.hungerStates[state];
  var right = 'Score: ' + score;
  var left =
      'Peasant | ' +
      hp + '/' + rl.MAX_HP + ' HP | ' +
      Math.floor(bread) + 'g bread | ' +
      '<span style="color: ' + hunger.color + '">' + hunger.name + '</span>';
  rl.view.setStatus(left, right);
}


rl.gameOver = function(cause) {
  var causeElem = goog.dom.getElement(cause);
  var welcomeElem = goog.dom.getElement('welcome');
  var messageElem = goog.dom.getElement('message');

  goog.dom.classes.remove(causeElem, 'hidden');
  goog.dom.classes.remove(messageElem, 'hidden');

  goog.events.removeAll(window);
  goog.events.listen(window, goog.events.EventType.KEYDOWN, function(e) {
    if (e.keyCode != goog.events.KeyCodes.SPACE) {
      return;
    }

    goog.dom.classes.add(causeElem, 'hidden');
    goog.dom.classes.remove(welcomeElem, 'hidden');
    rl.intro();
  });
}
