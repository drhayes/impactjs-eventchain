/*global ig: true */
ig.module(
  'game.system.eventChain'
)
.requires(
  'impact.impact'
)
.defines((function(global) {

  'use strict';

  var mixins = {};

  global.EventChain = function(context) {
    var steps, update;

    steps = [];

    // Called every frame.
    update = function() {
      if (steps && steps.length) {
        steps[0]();
      }
    };

    for (var name in mixins)
    {
      update[name] = mixins[name](context, steps);
    }

    // Returned from this factory thing.
    return update;
  };

  global.EventChain.mixin = function(name, fn) {
    mixins[name] = fn;
  };

  global.EventChain.mixin('then', function(context, steps) {
    return function(doThis) {
      steps.push(function() {
        // Update.
        doThis.call(context);
        // End.
        steps.shift();
      });
      return this;
    };
  });

  global.EventChain.mixin('wait', function(context, steps) {
    return function(secs) {
      var decrement = secs;
      steps.push(function() {
        // Update.
        if (decrement) {
          decrement -= ig.system.tick;
        }
        // End.
        if (decrement <= 0) {
          steps.shift();
          // Necessary because of repeat.
          decrement = secs;
        }
      });
      return this;
    };
  });

  global.EventChain.mixin('during', function(context, steps) {
    return function(doThis) {
      if (!steps) {
        throw new Error('during only works with previous step!');
      }
      var func = steps[steps.length - 1];
      steps[steps.length - 1] = function() {
        doThis.call(context);
        func();
      };
      return this;
    };
  });

  global.EventChain.mixin('repeat', function(context, steps) {
    return function(times) {
      var stepsCopy, originalTimes;
      times = times || Infinity;
      originalTimes = times;
      steps.push(function() {
        times -= 1;
        if (times > 0) {
          var args = stepsCopy.slice(0);
          args.unshift(1, 0);
          [].splice.apply(steps, args);
        } else {
          // For successive repeats.
          times = originalTimes;
        }
        // End.
        steps.shift();
      });
      stepsCopy = steps.slice(0);
      return this;
    };
  });

  global.EventChain.mixin('every', function(context) {
    return function(sec, doThis) {
      return this.during(
        global.EventChain(context)
          .wait(sec)
          .then(doThis)
          .repeat()
      );
    };
  });

  global.EventChain.mixin('orUntil', function(context, steps) {
    return function(predicate) {
      if (!steps) {
        throw new Error('orUntil only works with previous step!');
      }
      var func = steps[steps.length - 1];
      steps[steps.length - 1] = function() {
        if (predicate.call(context)) {
          steps.shift();
          return;
        }
        func();
      };
      return this;
    };
  });

  global.EventChain.mixin('waitForAnimation', function(context, steps) {
    return function(animation, times) {
      // If we were not given an animation, then look in context for
      // a currentAnim property.
      if (!times) {
        times = 1;
        if (typeof animation === 'number') {
          times = animation;
          animation = context.currentAnim;
        }
        if (typeof animation === 'undefined') {
          animation = context.currentAnim;
        }
      }
      steps.push(function() {
        if (animation.loopCount >= times) {
          steps.shift();
        }
      });
      return this;
    };
  });

}).bind(this, this));
