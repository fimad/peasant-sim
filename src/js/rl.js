goog.provide('rl');
goog.require('rl.map');
goog.require('rl.view');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');


rl.init = function() {
  rl.view.init();
  rl.view.setCellGenerator(rl.map.newWorld())
  goog.events.listen(window, goog.events.EventType.KEYDOWN, rl.intro);
}

rl.intro = function(e) {
  if (e.keyCode != goog.events.KeyCodes.SPACE) {
    return;
  }

  var i = 0;
  var slides = goog.dom.getChildren(goog.dom.getElement('message'));
  for (i = 0; i < slides.length - 1; i++) {
    if (!goog.dom.classes.has(slides[i], 'hidden')) {
      goog.dom.classes.add(slides[i], 'hidden');
      goog.dom.classes.remove(slides[i + 1], 'hidden');
      break;
    }
  }

  // Begin the game if there are no slides left...
  if (i == slides.length) {
    alert("begin!")
  }
}
