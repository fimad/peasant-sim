goog.provide('rl.npc.dogs');
goog.require('rl.map');
goog.require('rl.npc.Npc');


/** @const {number} */
rl.npc.dogs.MIN_DAMAGE = 1;


/** @const {number} */
rl.npc.dogs.MAX_DAMAGE = 4;


/** @const {number} */
rl.npc.dogs.STARTING_MIN = 5;


/** @const {number} */
rl.npc.dogs.STARTING_MAX = 20;


/** @const {number} */
rl.npc.dogs.DOG_PROB = .2;


/** @const {number} */
rl.npc.dogs.JITTER = 10;


/**
 * Takes a world function and an NPC manager and spawns a bunch of dogs.
 * @param {rl.map.WorldFunc} world A world function.
 * @param {rl.npc.NpcManager} manager The NpcManager to register the dogs with.
 */
rl.npc.dogs.spawn = function(world, manager) {
  // Randomly choose a quadrant to spawn all of the dogs in.
  var randSign = function() {return (Math.random() > .5) ? -1 : 1;};
  var xSign = randSign();
  var ySign = randSign();

  for (var x = rl.npc.dogs.STARTING_MIN; x < rl.npc.dogs.STARTING_MAX; x++) {
    for (var y = rl.npc.dogs.STARTING_MIN; y < rl.npc.dogs.STARTING_MAX; y++) {
      if (Math.random() > rl.npc.dogs.DOG_PROB) {
        continue;
      }

      var realX = xSign * x;
      var realY = ySign * y;
      var cell = world(realX, realY);
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

  goog.array.sort(moves, function(a, b) {
    var aDist = Math.pow(game.getX() - a.x, 2)
              + Math.pow(game.getY() - a.y, 2)
              + (rl.npc.dogs.JITTER * Math.random());
    var bDist = Math.pow(game.getX() - b.x, 2)
              + Math.pow(game.getY() - b.y, 2)
              + (rl.npc.dogs.JITTER * Math.random());
    return (aDist < bDist) ? -1 : (aDist == bDist) ? 0 : 1;
  });

  for (var i = 0; i < moves.length; i++) {
    var move = moves[i];

    if (move.x == game.getX() && move.y == game.getY()) {
      var spread = rl.npc.dogs.MAX_DAMAGE - rl.npc.dogs.MIN_DAMAGE;
      game.doDamage(Math.floor(Math.random() * spread + rl.npc.dogs.MAX_DAMAGE));
      break;
    }

    if (!rl.map.isWalkable(game.getWorld()(move.x, move.y))) {
      continue;
    }

    this.moveTo(move.x, move.y);
    break;
  }
};
