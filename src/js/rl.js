goog.provide('rl');
goog.require('rl.Game');
goog.require('rl.npc.NpcManager');
goog.require('rl.npc.dogs');
goog.require('rl.map');
goog.require('rl.view');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');


/** @type{Object.<goog.events.KeyCodes, rl.Game.Command>} */
rl.controls_ = {};
rl.controls_[goog.events.KeyCodes.LEFT] = rl.Game.Command.MOVE_LEFT;
rl.controls_[goog.events.KeyCodes.DOWN] = rl.Game.Command.MOVE_DOWN;
rl.controls_[goog.events.KeyCodes.UP] = rl.Game.Command.MOVE_UP;
rl.controls_[goog.events.KeyCodes.RIGHT] = rl.Game.Command.MOVE_RIGHT;

rl.controls_[goog.events.KeyCodes.H] = rl.Game.Command.MOVE_LEFT;
rl.controls_[goog.events.KeyCodes.J] = rl.Game.Command.MOVE_DOWN;
rl.controls_[goog.events.KeyCodes.K] = rl.Game.Command.MOVE_UP;
rl.controls_[goog.events.KeyCodes.L] = rl.Game.Command.MOVE_RIGHT;

rl.controls_[goog.events.KeyCodes.SPACE] = rl.Game.Command.EAT;
rl.controls_[goog.events.KeyCodes.PERIOD] = rl.Game.Command.PAUSE;


/** Called on page load to set up the initial handlers and DOM. */
rl.init = function() {
  rl.view.init();
  rl.intro();
};
goog.exportSymbol('rl.init', rl.init);


/**
 * Cycles through the slides in the message box and begins the game once the
 * slides have run out.
 */
rl.intro = function() {
  // Display the world in the background.
  var world = rl.map.newWorld();
  rl.view.setCellGenerator(world);

  var key =
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
      goog.events.unlistenByKey(key);
      rl.newGame(world);
    }
  });
};


/**
 * @param {!Array.<rl.map.WorldFunc>} overlays
 * @return {rl.map.WorldFunc}
 */
rl.makeWorld = function(overlays) {
  return function(x, y) {
    return goog.array.flatten(
        goog.array.map(overlays, function(overlay){
          return overlay(x, y);
        }));
  };
};


/**
 *
 */
rl.newGame = function(terrain) {
  var game = new rl.Game();
  var npcMan = new rl.npc.NpcManager();

  var world = rl.makeWorld([
      goog.bind(game.overlay, game),
      goog.bind(npcMan.overlay, npcMan),
      terrain]);

  rl.npc.dogs.spawn(world, npcMan);
  game.addManager(npcMan);
  game.setWorld(world);

  // Replace the cell generator with one that displays the current user.
  rl.view.setCellGenerator(function(dx, dy) {
    return world(game.getX() + dx, game.getY() + dy);
  });
  rl.updateStatus(game);

  var key = goog.events.listen(
      window,
      goog.events.EventType.KEYDOWN,
      function(e) {
        var command = rl.controls_[e.keyCode];
        if (command != undefined) {
          game.update(command);

          rl.updateStatus(game);
          rl.view.redraw();

          if (game.isGameOver()) {
            goog.events.unlistenByKey(key);
            rl.gameOver(game.getGameOver());
          }
        }
      });
};


/** Updates the in game status bar. */
rl.updateStatus = function(game) {
  var hunger = game.getHungerState();
  var right = 'Score: ' + game.getScore();
  var left =
      'Peasant | ' +
      game.getHp() + '/' + rl.Game.MAX_HP + ' HP | ' +
      Math.floor(game.getBread()) + 'g bread | ' +
      '<span style="color: ' + hunger.color + '">' + hunger.name + '</span>';
  rl.view.setStatus(left, right);
};


/** @param {string} cause The id of the message slide to display.  */
rl.gameOver = function(cause) {
  var causeElem = goog.dom.getElement(cause);
  var welcomeElem = goog.dom.getElement('welcome');
  var messageElem = goog.dom.getElement('message');

  goog.dom.classes.remove(causeElem, 'hidden');
  goog.dom.classes.remove(messageElem, 'hidden');

  var key =
      goog.events.listen(window, goog.events.EventType.KEYDOWN, function(e) {
    if (e.keyCode != goog.events.KeyCodes.SPACE) {
      return;
    }

    goog.dom.classes.add(causeElem, 'hidden');
    goog.dom.classes.remove(welcomeElem, 'hidden');
    goog.events.unlistenByKey(key);
    rl.intro();
  });
};
