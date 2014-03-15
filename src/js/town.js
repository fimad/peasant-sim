goog.provide('rl.map.town');
goog.provide('rl.map.town.Manager');
goog.require('rl.Game');
goog.require('rl.Manager');
goog.require('rl.map');

goog.require('goog.array');


rl.map.town.CELL = {
  name: 'town',
  text: '#',
  color: '#E3E3E3',
  walkable: true
};



/**
 * @param {rl.map.WorldFunc} terrain A world function that will return only the
 *     terrain cells.
 * @param {rl.npc.Manager} npcs A reference to the NPC manager.
 * @extends {rl.Manager}
 * @constructor
 */
rl.map.town.Manager = function(terrain, npcs) {
  goog.base(this);

  /**
   * @type {rl.map.WorldFunc}
   * @private
   */
  this.terrain_ = terrain;

  /**
   * @type {SimplexNoise}
   * @private
   */
  this.noise_ = new SimplexNoise();

  /**
   * @type {rl.SparseMap.<boolean>}
   * @private
   */
  this.visited_ = new rl.SparseMap();

  /**
   * @type {rl.npc.Manager}
   * @private
   */
  this.npcs_ = npcs;

  /**
   * @type {boolean}
   * @private
   */
  this.inTown_ = false;
};
goog.inherits(rl.map.town.Manager, rl.Manager);


/** @return {boolean} */
rl.map.town.Manager.prototype.inTown = function() {
  return this.inTown_;
};


/**
 * @param {rl.Game} game
 */
rl.map.town.Manager.prototype.update = function(game) {
  this.inTown_ = false;
  var x = game.getX(), y = game.getY();
  if (this.overlay(x, y).length > 0) {
    this.inTown_ = true;
    this.visited_.add(x, y, true);

    game.rest();
    this.npcs_.clear();
    rl.npc.dogs.spawn(game, this.npcs_);
  }
};


/**
 * @type {rl.map.WorldFunc}
 */
rl.map.town.Manager.prototype.overlay = function(x, y) {
  var townZ = (1 + this.noise_.noise2D(x / 4, y / 4)) / 2;
  return (townZ > .99 &&
          rl.map.isWalkable(this.terrain_(x, y)) &&
          !this.visited_.get(x, y))
      ? [rl.map.town.CELL] : [];
}
