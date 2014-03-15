goog.provide('rl.npc.dogs');
goog.require('rl.map');
goog.require('rl.npc.Manager');
goog.require('rl.npc.Npc');


/** @const {number} */
rl.npc.dogs.MIN_DAMAGE = 1;


/** @const {number} */
rl.npc.dogs.MAX_DAMAGE = 3;


/** @const {number} */
rl.npc.dogs.RADIUS = 20;


/** @const {number} */
rl.npc.dogs.DOG_PROB = .02;


/** @const {number} */
rl.npc.dogs.JITTER = 6;


/**
 * Takes a world function and an NPC manager and spawns a bunch of dogs.
 * @param {rl.Game} game The current game state.
 * @param {rl.npc.Manager} manager The NPC manager to register the dogs with.
 */
rl.npc.dogs.spawn = function(game, manager) {
  for (var x = -rl.npc.dogs.RADIUS; x < rl.npc.dogs.RADIUS; x++) {
    for (var y = -rl.npc.dogs.RADIUS; y < rl.npc.dogs.RADIUS; y++) {
      if (Math.random() > rl.npc.dogs.DOG_PROB) {
        continue;
      }

      var realX = x + game.getX();
      var realY = y + game.getY();
      var cell = game.getWorld()(realX, realY);
      if (rl.map.isWalkable(cell)) {
        manager.add(new rl.npc.dogs.Dog(realX, realY));
      }
    }
  }
};


/**
 * @param {number} x
 * @param {number} y
 * @constructor
 * @extends {rl.npc.Npc}
 */
rl.npc.dogs.Dog = function(x, y) {
  goog.base(this, x, y);
};
goog.inherits(rl.npc.dogs.Dog, rl.npc.Npc);


/** @inheritDoc */
rl.npc.dogs.Dog.prototype.getCell = function() {
  return {
    name: 'dog',
    text: 'd',
    color: '#9E4D4D',
    walkable: false
  };
};


/** @inheritDoc */
rl.npc.dogs.Dog.prototype.update = function(game) {
  var pos = this.getPos();
  var moves = [
    {x: pos.x - 1, y: pos.y},
    {x: pos.x + 1, y: pos.y},
    {x: pos.x, y: pos.y - 1},
    {x: pos.x, y: pos.y + 1}
  ];

  // Chase the crumbs if there are any.
  var targetX, targetY;
  var crumbs = game.getCrumbs();
  if (crumbs.length == 0) {
    targetX = game.getX();
    targetY = game.getY();
  } else {
    targetX = crumbs[0].x;
    targetY = crumbs[0].y;
  }

  goog.array.sort(moves, function(a, b) {
    var aDist = Math.pow(targetX - a.x, 2)
              + Math.pow(targetY - a.y, 2)
              + (rl.npc.dogs.JITTER * Math.random());
    var bDist = Math.pow(targetX - b.x, 2)
              + Math.pow(targetY - b.y, 2)
              + (rl.npc.dogs.JITTER * Math.random());
    return (aDist < bDist) ? -1 : (aDist == bDist) ? 0 : 1;
  });

  for (var i = 0; i < moves.length; i++) {
    var move = moves[i];

    // Handle either attacking the peasant or eating a crumb of bread.
    if (move.x == targetX && move.y == targetY) {
      if (crumbs.length > 0) {
        game.eatCrumb(targetX, targetY);
      } else {
        var spread = rl.npc.dogs.MAX_DAMAGE - rl.npc.dogs.MIN_DAMAGE;
        var amnt = Math.floor(Math.random() * spread + rl.npc.dogs.MAX_DAMAGE);
        game.doDamage(amnt);
      }
      break;
    }

    if (!rl.map.isWalkable(game.getWorld()(move.x, move.y))) {
      continue;
    }

    this.moveTo(move.x, move.y);
    break;
  }
};
