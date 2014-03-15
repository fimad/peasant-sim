goog.provide('rl');
goog.require('rl.Game');
goog.require('rl.map');
goog.require('rl.map.town.Manager');
goog.require('rl.npc.Manager');
goog.require('rl.npc.dogs');
goog.require('rl.view');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.Event');
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
rl.controls_[goog.events.KeyCodes.D] = rl.Game.Command.DROP;
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

  var key = null;
  var listener = function(e) {
    if (e.keyCode != goog.events.KeyCodes.SPACE) {
      return;
    }

    var i = 0;
    var message = goog.dom.getElement('message');
    var slides = goog.dom.getElementsByClass('slide', message);
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
  };
  key = goog.events.listen(window, goog.events.EventType.KEYUP, listener);
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
 * @param {rl.map.WorldFunc} terrain A world function that will returns static
 *     terrain cells.
 */
rl.newGame = function(terrain) {
  var game = new rl.Game();
  var npcMan = new rl.npc.Manager();
  var townMan = new rl.map.town.Manager(terrain, npcMan);

  game.setWorld(rl.makeWorld([
      goog.bind(game.overlay, game),
      goog.bind(npcMan.overlay, npcMan),
      goog.bind(townMan.overlay, townMan),
      terrain]));

  rl.npc.dogs.spawn(game, npcMan);
  game.addManager(npcMan);
  game.addManager(townMan);

  // Replace the cell generator with one that displays the current user.
  rl.view.setCellGenerator(function(dx, dy) {
    return game.getWorld()(game.getX() + dx, game.getY() + dy);
  });
  rl.updateStatus(game);

  var key = null;
  var message = goog.dom.getElement('message');

  var listener = function(e) {
    if (!goog.dom.classes.has(message, 'hidden')) {
      return;
    }

    var command = rl.controls_[e.keyCode];
    if (command != undefined) {
      game.update(command);

      rl.updateStatus(game);
      rl.view.redraw();

      if (townMan.inTown()) {
        rl.showMessage('town', listener);
      }

      if (game.isGameOver()) {
        goog.events.unlistenByKey(key);
        rl.gameOver(game.getGameOver());
      }
    }
  };
  key = goog.events.listen(window, goog.events.EventType.KEYUP, listener);
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
      goog.events.listen(window, goog.events.EventType.KEYUP, function(e) {
    if (e.keyCode != goog.events.KeyCodes.SPACE) {
      return;
    }

    goog.dom.classes.add(causeElem, 'hidden');
    goog.dom.classes.remove(welcomeElem, 'hidden');
    goog.events.unlistenByKey(key);
    rl.intro();
  });
};


/**
 * @param {string} slideId The id of the message slide to display.
 * @param {function(goog.events.Event)} prevListener The event listener that
 *     should be set after the message is dismissed.
 */
rl.showMessage = function(slideId, prevListener) {
  var slide = goog.dom.getElement(slideId);
  var message = goog.dom.getElement('message');

  goog.dom.classes.remove(slide, 'hidden');
  goog.dom.classes.remove(message, 'hidden');

  var key = null;
  var listener = function(e) {
    if (e.keyCode != goog.events.KeyCodes.SPACE) {
      return;
    }

    goog.dom.classes.add(slide, 'hidden');
    goog.dom.classes.add(message, 'hidden');
    goog.events.unlistenByKey(key);
    goog.events.listen(window, goog.events.EventType.KEYUP, prevListener);
  };
  key = goog.events.listen(window, goog.events.EventType.KEYUP, listener);
};
