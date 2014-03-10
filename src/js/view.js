goog.provide('rl.view');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');


/**
 * @const
 * @type{number}
 */
rl.view.CELL_SIZE = 20;


/** @type{Element} */
rl.view._root = null;


/** @type{Array.<Array.<Element>>} */
rl.view._cells = null;

/** @type{?function(number, number): string} */
rl.view._cellGen = null;


/** Creates the initial view DOM and sets up event listeners. */
rl.view.init = function() {
  rl.view._root = goog.dom.getElement('map');
  goog.events.listen(window, goog.events.EventType.RESIZE, rl.view.onResize);
  rl.view.onResize();
}


rl.view.show = function() {
  rl.view._root
}


/**
 * Called when the screen is resized. This function recreates the view DOM that
 * holds the map elements.
 */
rl.view.onResize = function() {
  var root = goog.dom.createDom('div', {'class': 'map', 'id': 'map'});
  var cells = [];

  var width = document.documentElement.clientWidth;
  var height = document.documentElement.clientHeight;

  var cellWidth = Math.floor(width / rl.view.CELL_SIZE);
  var cellHeight = Math.floor(height / rl.view.CELL_SIZE);

  // Make sure that the cell width and heigh is odd so that there is a single
  // center for the player.
  cellWidth = cellWidth - ((cellWidth + 1) % 2);
  cellHeight = cellHeight - ((cellWidth + 1) % 2);

  root.style.left = ((width - (cellWidth * rl.view.CELL_SIZE)) / 2) + 'px';
  root.style.top = ((height - (cellHeight * rl.view.CELL_SIZE)) / 2) + 'px';

  root.width = cellWidth * rl.view.CELL_SIZE + 'px';
  root.height = cellHeight * rl.view.CELL_SIZE + 'px';

  for (var x = 0; x < cellWidth; x++) {
    cells[x] = [];
  }

  for (var y = 0; y < cellHeight; y++) {
    for (var x = 0; x < cellWidth; x++) {
      cells[x][y] = goog.dom.createDom('div', {'class': 'cell'});
      cells[x][y].innerText = '.';
      goog.dom.appendChild(root, cells[x][y]);
    }
  }

  var oldRoot = rl.view._root;
  rl.view._root = root;
  rl.view._cells = cells;

  rl.view.redraw();

  goog.dom.replaceNode(root, oldRoot);
}


/**
 * Sets the cell generating function and redraws the view.
 * @param{function(number, number): string} cellGen is a call back that will be
 *     used to generate the text for each of the cells.
 */
rl.view.setCellGenerator = function(cellGen) {
  rl.view._cellGen = cellGen;
  rl.view.redraw();
}


/** Redraws the view with the current cell generating function. */
rl.view.redraw = function() {
  if (!rl.view._cellGen) {
    return;
  }

  var width = rl.view._cells.length;
  var height = rl.view._cells[0].length;

  for(var x = 0; x < width; x++) {
    for(var y = 0; y < height; y++) {
      var dx = x - Math.floor(width / 2);
      var dy = y - Math.floor(height / 2);
      var cell = rl.view._cellGen(dx, dy);
      rl.view._cells[x][y].innerHTML = cell.text;
      rl.view._cells[x][y].style.color = cell.color;
    }
  }
}
