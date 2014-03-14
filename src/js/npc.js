goog.provide('rl.npc.Manager');
goog.provide('rl.npc.Npc');
goog.require('rl.Game');
goog.require('rl.SparseMap');
goog.require('rl.map');



/**
 * Npc is an abstract class that represents any entity on the map that has an
 * update function.
 *
 * @param {number} x
 * @param {number} y
 * @constructor
 */
rl.npc.Npc = function(x, y) {
  /**
   * @type {number}
   * @private
   */
  this.x_ = x;

  /**
   * @type {number}
   * @private
   */
  this.y_ = y;
};


/**
 * @param {number} x
 * @param {number} y
 */
rl.npc.Npc.prototype.moveTo = function(x, y) {
  this.x_ = x;
  this.y_ = y;
};


/** @return {{x: number, y: number}} */
rl.npc.Npc.prototype.getPos = function() {
  return {x: this.x_, y: this.y_};
};


/** @param {rl.Game} game */
rl.npc.Npc.prototype.update = goog.abstractMethod;


/** @return {rl.map.Cell} */
rl.npc.Npc.prototype.getCell = goog.abstractMethod;



/**
 * Manager maintains a set of all active NPCs and handles updating and
 * drawing them in the world.
 *
 * @constructor
 * @extends {rl.Manager}
 */
rl.npc.Manager = function() {
  /**
   * @type {!Array.<!rl.npc.Npc>}
   * @private
   */
  this.npcs_ = [];

  /**
   * @type {rl.SparseMap.<rl.npc.Npc>}
   * @private
   */
  this.npcCache_ = new rl.SparseMap();
};
goog.inherits(rl.npc.Manager, rl.Manager);


/**
 * Add an NPC to be tracked by the manager.
 * @param {rl.npc.Npc} npc
 * @return {boolean}
 */
rl.npc.Manager.prototype.add = function(npc) {
  var pos = npc.getPos();
  this.npcs_.push(npc);
  if (this.npcCache_.get(pos.x, pos.y)) {
    return false;
  }
  this.npcCache_.add(pos.x, pos.y, npc);
  return true;
};


/**
 * Removes all NPCs from the manager;
 */
rl.npc.Manager.prototype.clear = function() {
  this.npcs_ = [];
  this.npcCache_.clear();
};


/**
 * Runs the AI for all of active NPC's.
 * @override
 * @param {rl.Game} game
 */
rl.npc.Manager.prototype.update = function(game) {
  for (var i = 0; i < this.npcs_.length; i++) {
    var npc = this.npcs_[i];
    var oldPos = npc.getPos();
    npc.update(game);
    var newPos = npc.getPos();
    if (oldPos != newPos) {
      this.npcCache_.remove(oldPos.x, oldPos.y);
      this.npcCache_.add(newPos.x, newPos.y, npc);
    }
  }
};


/**
 * @type {rl.map.WorldFunc}
 */
rl.npc.Manager.prototype.overlay = function(x, y) {
  var npc = this.npcCache_.get(x, y);
  return (npc != null) ? [npc.getCell()] : [];
};
