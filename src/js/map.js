goog.provide('rl.map');
goog.require('rl.view');

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
 * Generates a new procedurally generated world.
 */
rl.map.newWorld = function() {
  var noise = new SimplexNoise();
  var cellGen = function(x, y) {
    var z = (1 + noise.noise2D(x / 25, y / 25)) / 2;
    for (var i = 0; i < rl.map._terrain.length; i++) {
      if (rl.map._terrain[i].cutoff >= z) {
        return rl.map._terrain[i].cell;
      }
    }
    return rl.map._terrain[rl.map._terrain.length - 1].cell;
  }

  // Make sure that the starting location is walkable.
  if (!cellGen(0, 0).walkable) {
    return rl.map.newWorld();
  }
  return cellGen;
}


/** @type {Array.<rl.map.Cell>} */
rl.map._terrain = [
  {
    cell: {
      name: 'water',
      text: '=',
      color: '#3D9DF2',
      walkable: false
    },
    cutoff: .05
  },
  {
    cell: {
      name: 'water',
      text: '~',
      color: '#3D9DF2',
      walkable: false
    },
    cutoff: .15
  },
  {
    cell: {
      name: 'dirt',
      text: '.',
      color: '#DED1AD',
      walkable: true
    },
    cutoff: .25
  },
  {
    cell: {
      name: 'plains',
      text: ',',
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
    cutoff: .65
  },
  {
    cell: {
      name: 'trees',
      text: '&#8648;',
      color: '#5BAD4C',
      walkable: true
    },
    cutoff: .7
  },
  {
    cell: {
      name: 'hills',
      text: '&#9652;',
      color: '#A8A8A8',
      walkable: false
    },
    cutoff: .9
  },
  {
    cell: {
      name: 'mountains',
      text: '&#9650;',
      color: '#E6E6E6',
      walkable: false
    },
    cutoff: 1
  }
];
