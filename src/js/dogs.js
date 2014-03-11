goog.provide('rl.dogs');

/** @const {number} */
rl.dogs.MIN_DAMAGE = 1;


/** @const {number} */
rl.dogs.MAX_DAMAGE = 4;


/** @const {number} */
rl.dogs.STARTING_MIN = 5;


/** @const {number} */
rl.dogs.STARTING_MAX = 20;


/** @const {number} */
rl.dogs.DOG_PROB = .2;


/**
 * @typedef {{
 *  x: number,
 *  y: number
 * }}
 */
rl.dogs.Dog;

/**
 * Overlays the dog characters onto the world map.
 * @param {Array.<rl.dogs.Dog>} dogs A list of dog NPS that should be displayed.
 * @param {function(number, number): rl.map.Cell} world A world function.
 * @return {function(number, number): rl.map.Cell}
 */
rl.dogs.overlay = function(dogs, world) {
  return function(x, y) {
    for (var i = 0; i < dogs.length; i++) {
      if (dogs[i].x == x && dogs[i].y == y) {
        return {
          text: 'd',
          color: '#9E4D4D',
          walkable: false
        };
      }
    }
    return world(x, y);
  };
}


/**
 * Takes a world function and returns a list of new dogs.
 * @param {function(number, number): rl.map.Cell} world A world function.
 * @return {Array.<rl.dogs.Dog>}
 */
rl.dogs.spawn = function(world) {
  // Randomly choose a quadrant to spawn all of the dogs in.
  var randSign = function() {return (Math.random() > .5) ? -1 : 1;};
  var xSign = randSign();
  var ySign = randSign();

  var i = 0;
  var dogs = [];
  for (var x = rl.dogs.STARTING_MIN; x < rl.dogs.STARTING_MAX; x++) {
    for (var y = rl.dogs.STARTING_MIN; y < rl.dogs.STARTING_MAX; y++) {
      if (Math.random() > rl.dogs.DOG_PROB) {
        continue;
      }

      var dog = {x: xSign * x, y: ySign * y};
      if (world(dog.x, dog.y).walkable) {
        dogs[i] = dog;
        i++;
      }
    }
  }

  return dogs;
}


/**
 * Updates the dogs location and returns the amount of damager that they were
 * able to inflict on the peasant.
 * @param {Array.<rl.dog.Dog>} dogs An array of all of the dogs to update.
 * @param {function(number, number): rl.map.Cell} world A world function.
 * @param {number} targetX The x coordinate of the peasant.
 * @param {number} targetY The y coordinate of the peasant.
 * @return {number}
 */
rl.dogs.update = function(dogs, world, targetX, targetY) {
  // Sort the dogs so that the ones closest to the peasant get to move first.
  goog.array.sort(dogs, function(a, b) {
    var aDist = Math.pow(targetX - a.x, 2) + Math.pow(targetY - a.y, 2);
    var bDist = Math.pow(targetX - b.x, 2) + Math.pow(targetY - b.y, 2);
    return (aDist < bDist) ? -1 : (aDist == bDist) ? 0 : 1;
  });

  var damage = 0;

  for (var i = 0; i < dogs.length; i++) {
    var newDog = rl.dogs.pathFind(dogs[i], dogs, world, targetX, targetY);

    // If the dog is about to move on top of the peasant, the dog should attack
    // instead of moving.
    if (newDog.x == targetX && newDog.y == targetY) {
      var spread = rl.dogs.MAX_DAMAGE - rl.dogs.MIN_DAMAGE;
      damage += Math.floor(Math.random() * spread + rl.dogs.MAX_DAMAGE);
    } else {
      dogs[i] = newDog;
    }
  }

  return damage;
}


/**
 * Returns a new dog object updated with a location that is closer to the
 * peasant. Currently uses a very naive best first search.
 * TODO: use A* or all pairs shortest for this.
 * @param {rl.dog.Dog} dog The dog that is doing the path finding.
 * @param {Array.<rl.dog.Dog>} dogs An array of all of the other dogs.
 * @param {function(number, number): rl.map.Cell} world A world function.
 * @param {number} targetX The x coordinate of the peasant.
 * @param {number} targetY The y coordinate of the peasant.
 * @return {rl.dog.Dog}
 */
rl.dogs.pathFind = function(dog, dogs, world, targetX, targetY) {
  var newDogs = [
    {x: dog.x - 1, y: dog.y},
    {x: dog.x + 1, y: dog.y},
    {x: dog.x, y: dog.y - 1},
    {x: dog.x, y: dog.y + 1}
  ];

  goog.array.sort(newDogs, function(a, b) {
    var aDist = Math.pow(targetX - a.x, 2) + Math.pow(targetY - a.y, 2);
    var bDist = Math.pow(targetX - b.x, 2) + Math.pow(targetY - b.y, 2);
    return (aDist < bDist) ? -1 : (aDist == bDist) ? 0 : 1;
  });

  for (var i = 0; i < newDogs.length; i++) {
    var newDog = newDogs[i];
    if (!world(newDog.x, newDog.y).walkable) {
      continue;
    }

    var ok = true;
    for (var j = 0; j < dogs.length; j++) {
      if (dogs[j].x == newDog.x && dogs[j].y == newDog.y) {
        ok = false;
        break;
      }
    }

    if (ok) {
      return newDog;
    }
  }

  return dog;
}
