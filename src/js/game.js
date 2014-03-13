goog.provide('rl.Game');
goog.provide('rl.Manager');
goog.require('rl.map');



/**
 * A Manager is any object with an update function that takes a game state.
 * Used for updating a collection of individual game elements like NPCs or
 * items.
 * @constructor
 */
rl.Manager = function() {};


/**
 * This method will be called once per frame.
 * @param {rl.Game} game The current game state.
 */
rl.Manager.prototype.update = goog.abstractMethod;



/**
 * A Game contains all of the state associated with one session of a peasant
 * simulator.
 *
 * @constructor
 */
rl.Game = function() {
  /**
   * @type {number}
   * @private
   */
  this.x_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.y_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.hp_ = rl.Game.MAX_HP;

  /**
   * @type {number}
   * @private
   */
  this.bread_ = rl.Game.MAX_BREAD;

  /**
   * @type {number}
   * @private
   */
  this.score_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.hungerState_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.hungerSteps_ = 0;

  /**
   * @type {string}
   * @private
   */
  this.gameOver_ = '';

  /**
   * @type {!Array.<!rl.Manager>}
   * @private
   */
  this.managers_ = [];

  /**
   * @type {?rl.map.WorldFunc}
   * @private
   */
  this.world_ = null;
};


/** @const {number} */
rl.Game.MAX_HP = 13;


/** @const {number} */
rl.Game.MAX_BREAD = 800;


/** @const {number} */
rl.Game.BREAD_SLICE = rl.Game.MAX_BREAD / 5;


/** @const {number} */
rl.Game.BREAD_FILL_UP = 2;


/** @const {number} */
rl.Game.STEPS_PER_HUNGER_STATE = 10;


/** @const {string} */
rl.Game.GAME_OVER_STARVED = 'dead_starved';


/** @const {string} */
rl.Game.GAME_OVER_EATEN = 'dead_eaten';


/** @const {rl.map.Cell} */
rl.Game.SELF_CELL = {
  name: 'self',
  text: '@',
  color: '#FFF',
  walkable: false
};


/** @typedef {{
 *  name: string,
 *  color: string
 * }} */
rl.Game.HungerState;


/** @type {Array.<rl.Game.HungerState>} */
rl.Game.hungerStates = [
  {name: 'sated', color: '#FFF'},
  {name: 'content', color: '#FFF'},
  {name: 'peckish', color: '#FFF'},
  {name: 'hungry', color: '#FFF'},
  {name: 'hungry!', color: '#FFEA8C'},
  {name: 'STARVING!', color: '#FF0000'}
];


/**
 * @enum {number}
 */
rl.Game.Command = {
  MOVE_LEFT: 1,
  MOVE_DOWN: 2,
  MOVE_UP: 3,
  MOVE_RIGHT: 4,
  EAT: 5,
  PAUSE: 6
}

rl.Game.prototype.setWorld = function(world) {this.world_ = world;};
rl.Game.prototype.getWorld = function() {return this.world_;};

rl.Game.prototype.getBread = function() {return this.bread_;};
rl.Game.prototype.getHp = function() {return this.hp_;};
rl.Game.prototype.getScore = function() {return this.score_;};
rl.Game.prototype.getX = function() {return this.x_;};
rl.Game.prototype.getY = function() {return this.y_;};

rl.Game.prototype.isGameOver = function() {return this.gameOver_ != '';};
rl.Game.prototype.getGameOver = function() {return this.gameOver_;};

rl.Game.prototype.getHungerState = function() {
  return rl.Game.hungerStates[this.hungerState_];
};

rl.Game.prototype.addManager = function(manager) {
  this.managers_.push(manager);
};


/**
 * @param {rl.Game.Command} command
 */
rl.Game.prototype.update = function(command) {
  var newX = this.x_, newY = this.y_;

  switch (command) {
    case rl.Game.Command.MOVE_LEFT:
      newX--; break;
    case rl.Game.Command.MOVE_DOWN:
      newY++; break;
    case rl.Game.Command.MOVE_UP:
      newY--; break;
    case rl.Game.Command.MOVE_RIGHT:
      newX++; break;
    case rl.Game.Command.EAT:
      if (this.bread_ > 0) {
        this.hungerState_ -= rl.Game.BREAD_FILL_UP;
        this.hungerState_ = Math.max(0, this.hungerState_);
        this.bread_ -= rl.Game.BREAD_SLICE;
      }
      break;
  }

  this.score_++;
  this.hungerSteps_++;

  var newCell = this.world_(newX, newY);
  if (rl.map.isWalkable(newCell)) {
    this.x_ = newX;
    this.y_ = newY;
  }

  // Update each of the managers in sequence.
  for (var i = 0; i < this.managers_.length; i++) {
    this.managers_[i].update(this);
  }

  // Check for death by being beaten to death.
  this.hp_ = Math.max(0, this.hp_);
  if (this.hp_ == 0) {
    this.gameOver_ = rl.Game.GAME_OVER_EATEN;
  }

  // Check for death by starving to death.
  if (this.hungerSteps_ >= rl.Game.STEPS_PER_HUNGER_STATE) {
    this.hungerSteps_ = 0;
    this.hungerState_++;
    if (this.hungerState_ == rl.Game.hungerStates.length) {
      this.hungerState_--;
      this.hp_ = 0;
      this.gameOver_ = rl.Game.GAME_OVER_STARVED;
    }
  }
};


/**
 * @type {rl.map.WorldFunc}
 */
rl.Game.prototype.overlay = function(x, y) {
  var cells = [];
  if (this.x_ == x && this.y_ == y) {
    cells.push(rl.Game.SELF_CELL);
  }
  return cells;
};
