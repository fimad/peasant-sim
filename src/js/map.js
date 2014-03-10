goog.provide('rl.map');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('rl.view');


/** @typedef{Array.<Array<rl.map.Cell>>} */
rl.map.Map;

/**
 * @typedef{Object.<
 *  symbol
 * >}
 */
rl.map.Cell;


rl.map.newWorld = function() {
}

rl.map.newSimplex = function() {
  var noise = new SimplexNoise();

  var x = 0;
  var y = 0;

  goog.events.listen(window, goog.events.EventType.KEYDOWN, function(e) {
    var newX = x, newY = y;
    switch(e.keyCode) {
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
    }
    var z = (1 + noise.noise2D(newX / 25, newY / 25)) / 2;
    if (z > 1/4 && z < 3/4) {
      x = newX;
      y = newY;
    }
    rl.view.redraw();
  });

  return function(dx, dy) {
    var z = noise.noise2D((x + dx) / 25, (y + dy) / 25);
    if (dx == 0 && dy == 0) {
      return {text: '@', color: '#FFF'};
    }

    var grad = [
      // Mountains
      "&#9650;",
      // Trees
      "&#9155;",
      // Ground
      ".",
      // Water
      "~"
      ];
      //"MNmdhyso+/:-.`";
    var colors = ["#A8A8A8", "#5BAD4C", "#DED1AD", "#3D9DF2"];
    return {
      text: grad[Math.floor(grad.length * (z + 1)/2)],
      color: colors[Math.floor(colors.length * (z + 1)/2)],
    };
  }
}
