goog.provide('rl.SparseMap');



/**
 * A sparse 2D map.
 * @constructor
 * @template T
 */
rl.SparseMap = function() {
  /**
   * @type {!Object.<number, !Object.<number, !T>>}
   * @private
   */
  this.map_ = {};
}


/**
 * @param {number} x
 * @param {number} y
 * @param {T} obj
 */
rl.SparseMap.prototype.add = function(x, y, obj) {
  var yMap = this.map_[x];
  if (!yMap) {
    yMap = {};
    this.map_[x] = yMap;
  }
  yMap[y] = obj;
};


/**
 * @param {number} x
 * @param {number} y
 */
rl.SparseMap.prototype.remove = function(x, y) {
  if (Object.keys(this.map_[x]).length == 1 && this.map_[x][y]) {
    delete this.map_[x];
  } else if (Object.keys(this.map_[x]).length > 1 && this.map_[x][y]) {
    delete this.map_[x][y];
  }
};


/**
 * @param {number} x
 * @param {number} y
 * @return {T}
 */
rl.SparseMap.prototype.get = function(x, y) {
  return (!this.map_[x]) ? null : this.map_[x][y];
};


/**
 */
rl.SparseMap.prototype.clear = function() {
  this.map_ = {};
};
