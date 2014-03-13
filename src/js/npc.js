goog.provide('rl.npc.Npc');
goog.provide('rl.npc.NpcManager');
goog.require('rl.Game');
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
 * NpcManager maintains a set of all active NPCs and handles updating and
 * drawing them in the world.
 *
 * @constructor
 * @extends {rl.Manager}
 */
rl.npc.NpcManager = function() {
  /**
   * @type {!Array.<!rl.npc.Npc>}
   * @private
   */
  this.npcs_ = [];

  /**
   * @type {!Object.<number, !Object.<number, !rl.npc.Npc>>}
   * @private
   */
  this.npcCache_ = {};
};
goog.inherits(rl.npc.NpcManager, rl.Manager);


/**
 * Add an NPC to be tracked by the manager.
 * @param {rl.npc.Npc} npc
 * @return {boolean}
 */
rl.npc.NpcManager.prototype.add = function(npc) {
  var pos = npc.getPos();
  this.npcs_.push(npc);
  if (this.cacheGet(pos.x, pos.y)) {
    return false;
  }
  this.cacheAdd(pos.x, pos.y, npc);
  return true;
};


/**
 * @param {number} x
 * @param {number} y
 * @param {rl.npc.Npc} npc
 */
rl.npc.NpcManager.prototype.cacheAdd = function(x, y, npc) {
  var yCache = this.npcCache_[x];
  if (!yCache) {
    yCache = {};
    this.npcCache_[x] = yCache;
  }
  yCache[y] = npc;
};


/**
 * @param {number} x
 * @param {number} y
 */
rl.npc.NpcManager.prototype.cacheRemove = function(x, y) {
  if (Object.keys(this.npcCache_[x]).length == 1 && this.npcCache_[x][y]) {
    delete this.npcCache_[x];
  } else if (Object.keys(this.npcCache_[x]).length > 1 && this.npcCache_[x][y]) {
    delete this.npcCache_[x][y];
  }
};


/**
 * @param {number} x
 * @param {number} y
 * @return {rl.npc.Npc}
 */
rl.npc.NpcManager.prototype.cacheGet = function(x, y) {
  return (!this.npcCache_[x]) ? null : this.npcCache_[x][y];
};


/**
 * Runs the AI for all of active NPC's.
 * @override
 * @param {rl.Game} game
 */
rl.npc.NpcManager.prototype.update = function(game) {
  for (var i = 0; i < this.npcs_.length; i++) {
    var npc = this.npcs_[i];
    var oldPos = npc.getPos();
    npc.update(game);
    var newPos = npc.getPos();
    if (oldPos != newPos) {
      this.cacheRemove(oldPos.x, oldPos.y);
      this.cacheAdd(newPos.x, newPos.y, npc);
    }
  }
};


/**
 * @type {rl.map.WorldFunc}
 */
rl.npc.NpcManager.prototype.overlay = function(x, y) {
  var npc = this.cacheGet(x, y);
  return (npc != null) ? [npc.getCell()] : [];
};
