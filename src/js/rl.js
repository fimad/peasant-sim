goog.provide('rl');
goog.require('rl.view');
goog.require('rl.map');


rl.init = function() {
  rl.view.init();
  rl.view.setCellGenerator(rl.map.newSimplex())
}
