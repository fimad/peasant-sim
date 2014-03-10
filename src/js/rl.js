goog.provide('rl');
goog.require('rl.map');
goog.require('rl.view');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');


/** Called on page load to set up the initial handlers and DOM. */
rl.init = function() {
  rl.view.init();
  //rl.view.setCellGenerator(rl.map.newWorld())
  goog.events.listen(window, goog.events.EventType.KEYDOWN, rl.intro);
}

/**
 * Cycles through the slides in the message box and begins the game once the
 * slides have run out.
 */
rl.intro = function(e) {
  if (e.keyCode != goog.events.KeyCodes.SPACE) {
    return;
  }

  var i = 0;
  var message = goog.dom.getElement('message');
  var slides = goog.dom.getChildren(message);
  for (i = 0; i < slides.length - 1; i++) {
    if (!goog.dom.classes.has(slides[i], 'hidden')) {
      goog.dom.classes.add(slides[i], 'hidden');
      goog.dom.classes.remove(slides[i + 1], 'hidden');
      break;
    }
  }

  // Begin the game if there are no slides left...
  if (i == slides.length - 1) {
    goog.dom.classes.add(slides[slides.length - 1], 'hidden');
    goog.dom.classes.add(message, 'hidden');
    goog.events.removeAll(window);
  }
}
