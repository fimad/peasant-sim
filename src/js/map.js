goog.provide('rl.map');

goog.require('goog.array');

/**
 * @typedef {{
 *  text: string,
 *  name: string,
 *  color: string,
 *  walkable: boolean
 * }}
 */
rl.map.Cell;


/**
 * @typedef {{
 *  cell: rl.map.Cell,
 *  cutoff: number
 * }}
 */
rl.map.Terrain;


/**
 * @typedef {function(number, number): !Array.<rl.map.Cell>}
 */
rl.map.WorldFunc;


/**
 * Given an array of cells returns true if all of the cells are walkable and
 * false otherwise.
 * @param {Array.<rl.map.Cell>} cells
 * @return {boolean}
 */
rl.map.isWalkable = function(cells) {
  return !goog.array.some(cells, function(cell) {
    return cell.walkable == false
  });
};


rl.map.pickCell = function(z, list) {
  var cell = list[list.length - 1].cell;
  for (var i = 0; i < list.length; i++) {
    if (z >= list[i].cutoff) {
      cell = list[i].cell;
    }
  }
  return cell;
}


/**
 * Generates a new procedurally generated world.
 * @return {rl.map.WorldFunc}
 */
rl.map.newWorld = function() {
  var terrainNoise = new SimplexNoise();
  var floraNoise = new SimplexNoise();

  var cellGen = function(x, y) {
    var terrainZ = (1 + terrainNoise.noise2D(x / 25, y / 25)) / 2;
    var floraZ = (1 + floraNoise.noise2D(x / 10, y / 10)) / 2;

    var terrainCell = rl.map.pickCell(terrainZ, rl.map._terrain)
    var floraCell = rl.map.pickCell(floraZ, rl.map._flora)

    if (terrainCell.walkable) {
      return [floraCell];
    }
    return [terrainCell];
  }

  // Make sure that the starting location is walkable.
  if (!rl.map.isWalkable(cellGen(0, 0))) {
    console.log(cellGen(0,0));
    return;
    return rl.map.newWorld();
  }
  return cellGen;
};


/** @type {Array.<{cell: rl.map.Cell, cutoff: number}>} */
rl.map._terrain = [
  {
    cell: {
      name: 'water',
      text: '=',
      color: '#3D9DF2',
      walkable: false
    },
    cutoff: .00
  },
  {
    cell: {
      name: 'water',
      text: '~',
      color: '#3D9DF2',
      walkable: false
    },
    cutoff: .1
  },
  {
    cell: {
      name: 'dirt',
      text: '.',
      color: '#DED1AD',
      walkable: true
    },
    cutoff: .2
  },
  {
    cell: {
      name: 'dirt',
      text: ':',
      color: '#DED1AD',
      walkable: true
    },
    cutoff: .4
  },
  {
    cell: {
      name: 'hills',
      text: '&#9652;',
      color: '#A8A8A8',
      walkable: false
    },
    cutoff: .7
  },
  {
    cell: {
      name: 'mountains',
      text: '&#9650;',
      color: '#E6E6E6',
      walkable: false
    },
    cutoff: .85
  }
];


/** @type {Array.<{cell: rl.map.Cell, cutoff: number}>} */
rl.map._flora = [
  {
    cell: {
      name: 'dirt',
      text: '.',
      color: '#DED1AD',
      walkable: true
    },
    cutoff: 0
  },
  {
    cell: {
      name: 'dirt',
      text: ',',
      color: '#DED1AD',
      walkable: true
    },
    cutoff: .1,
  },
  {
    cell: {
      name: 'plains',
      text: '\'',
      color: '#FAF39B',
      walkable: true
    },
    cutoff: .2,
  },
  {
    cell: {
      name: 'plains',
      text: '"',
      color: '#FAF39B',
      walkable: true
    },
    cutoff: .3,
  },
  {
    cell: {
      name: 'shrubbery',
      text: '"',
      color: '#9EA36F',
      walkable: true
    },
    cutoff: .4
  },
  {
    cell: {
      name: 'trees',
      text: '&#9155;',
      color: '#70AD4C',
      walkable: true
    },
    cutoff: .5
  },
  {
    cell: {
      name: 'trees',
      text: '&#9880;',
      color: '#70AD4C',
      walkable: true
    },
    cutoff: .6
  },
  {
    cell: {
      name: 'trees',
      text: '&#8607;',
      color: '#5BAD4C',
      walkable: true
    },
    cutoff: .7
  },
  {
    cell: {
      name: 'trees',
      text: '&#8648;',
      color: '#5BAD4C',
      walkable: true
    },
    cutoff: .8
  }
];
