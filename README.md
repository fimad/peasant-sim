# Peasant Simulator #

Peasant Simulator was my entry for the [2014 7 Day Rogue-like
Challenge](http://7drl.roguetemple.com/). You can see it in action
[here](http://peasant.greatbarrel.com/).

## Dependencies ##

The following dependencies are required to build Peasant Simulator.

  - [Closure](http://developers.google.com/closure/)
  - [Less](http://lesscss.org/)

## Building ##

You will need to define two environment variables in order to build Peasant
Simulator.

  - `CLOSURE_COMPILER` - Points to the Closure compiler jar file.
  - `COLSURE_ROOT` - The root directory of the Closure library installation.
                     This directory will contains `closure/` and `third_party/`
                     directories.

Once you have that set up, you can run `make` and a deployable build will be
copied into the `build` directory.
