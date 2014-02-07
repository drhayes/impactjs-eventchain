/* global require, global, describe, beforeEach, it */

'use strict';

var assert = require('assert');

// Fake the Impact global namespace with good enough definitions.
var ig = global.ig = {
  // Properties used by eventChain.
  system: {
    tick: 0
  },
  // Impact module definition stuff.
  module: function() {
    return this;
  },
  requires: function() {
    return this;
  },
  defines: function(definition) {
    definition();
  }
};

// The module declares eventChain globally.
var eventChain = require('../eventChain.js').EventChain;

describe('eventChain', function() {
  var chain;

  beforeEach(function() {
    // Reset ig namespace state.
    ig.system.tick = 0;
    // Instantiate a new chain.
    chain = eventChain();
  });

  it('defines some functions', function() {
    var operators = ['then', 'wait', 'during', 'repeat', 'every'];
    operators.forEach(function(operator) {
      assert(chain[operator]);
    });
  });

  it('is itself a function', function() {
    assert(typeof chain === 'function');
  });

  it('has a then function that executes every invocation', function() {
    var counter = 0;
    chain
      .then(function() {
        counter += 1;
      })
      .then(function() {
        counter += 1;
      });
      // Now invoke it four times.
    chain();
    chain();
    chain();
    chain();
    assert(counter === 2);
  });

  it('can wait before executing', function() {
    var done = false;
    chain
      .wait(2)
      .then(function() {
        done = true;
      });
    // Now invoke the chain while ig.system.tick is 0.
    chain();
    chain();
    chain();
    chain();
    assert(!done);
    // Now set our tick to 5.
    ig.system.tick = 5;
    chain();
    chain();
    assert(done);
  });

  it('can do stuff during a wait', function() {
    var duringCounter = 0;
    var done = false;
    chain
      .wait(2)
      .during(function() {
        duringCounter += 1;
      })
      .then(function() {
        done = true;
      });
    ig.system.tick = 1;
    chain();
    chain();
    chain();
    assert(duringCounter === 2);
    assert(done);
  });

  it('can repeat steps', function() {
    var repeat1 = 0;
    var repeat2 = 0;
    chain
      .then(function() {
        repeat1 += 1;
      })
      .repeat(2)
      .then(function() {
        repeat2 += 1;
      })
      .repeat(2);
    chain(); // First then
    chain(); // First repeat
    chain(); // First then again
    chain(); // First repeat again
    chain(); // Second then
    chain(); // Second repeat
    chain(); // First then 3
    chain(); // First repeat 3
    chain(); // First then 4
    chain(); // First repeat 4
    chain(); // Second then 2
    assert(repeat1 === 4);
    assert(repeat2 === 2);
  });

  it('can do something every N seconds', function() {
    ig.system.tick = 0.1;
    var counter = 0;
    chain
      .wait(5)
      .every(1, function() {
        counter += 1;
      });
    // Turns out that "wait" isn't an exact waiter.
    for (var i = 0; i < 75; i++) {
      chain();
    }
    assert(counter === 4);
  });

  it('calls then callback within given context', function() {
    var Fake = function() {
      this.called = false;
      this.callback = function() {
        this.called = true;
      };
      this.chain = eventChain(this)
        .then(this.callback);
    };
    var f = new Fake();
    f.chain();
    assert(f.called);
  });

  it('calls during callback within given context', function() {
    var Fake = function() {
      this.called = false;
      this.callback = function() {
        this.called = true;
      };
      this.chain = eventChain(this)
        .wait(1)
        .during(this.callback);
    };
    var f = new Fake();
    f.chain();
    assert(f.called);
  });

  it('calls every callback within given context', function() {
    ig.system.tick = 0.1;
    var Fake = function() {
      this.called = false;
      this.callback = function() {
        this.called = true;
      };
      this.chain = eventChain(this)
        .wait(1)
        .every(0.1, this.callback);
    };
    var f = new Fake();
    f.chain(); // first wait
    f.chain(); // first then
    assert(f.called);
  });

  it('can end a wait conditionally', function() {
    ig.system.tick = 0.1;
    var counter1 = 0, counter2 = 0;
    chain
      .wait(5)
      .orUntil(function() {
        if (counter1 > 5) {
          return true;
        }
        counter1 += 1;
      })
      .then(function() {
        counter2 += 1;
      })
      .repeat();
    // Wait is not super exact.
    for (var i = 0; i < 12; i++) {
      chain();
    }
    assert(counter1 === 6);
    assert(counter2 === 2);
  });

  it('can predicate a wait with a context', function() {
    var Fake = function() {
      this.counter = 0;
      this.chain = eventChain(this)
        .wait(5)
        .orUntil(function() {
          if (this.counter > 5) {
            return false;
          }
          this.counter += 1;
        });
    };
    ig.system.tick = 0.1;
    var f = new Fake();
    // Wait is not super exact.
    for (var i = 0; i < 6; i++) {
      f.chain();
    }
    assert(f.counter === 6);
  });

  it('can wait until an animation finishes', function() {
    var fakeAnimation = {
      loopCount: 0
    };
    var done = false;
    chain
      .waitForAnimation(fakeAnimation)
      .then(function() {
        done = true;
      });
    chain();
    assert(!done);
    chain();
    assert(!done);
    chain();
    assert(!done);
    fakeAnimation.loopCount = 1;
    chain();
    chain();
    assert(done);
  });

  it('can wait until an animation loops n times', function(){
    var fakeAnimation = {
      loopCount: 0
    };
    var done = false;
    chain
      .waitForAnimation(fakeAnimation, 2)
      .then(function() {
        done = true;
      });
    chain();
    assert(!done);
    chain();
    assert(!done);
    chain();
    assert(!done);
    fakeAnimation.loopCount = 1;
    chain();
    chain();
    assert(!done);
    fakeAnimation.loopCount = 2;
    chain();
    chain();
    assert(done);
  });

  it('can wait for current animation if none specified', function() {
    var done = false;
    var Fake = function() {
      // This is supposed to mimic an Entity's currentAnim property.
      this.currentAnim = {
        loopCount: 0
      };
      this.chain = eventChain(this)
        .waitForAnimation()
        .then(function() {
          done = true;
        });
    };
    var f = new Fake();
    f.chain();
    assert(!done);
    f.chain();
    assert(!done);
    f.currentAnim.loopCount = 1;
    f.chain();
    f.chain();
    assert(done);
  });

  it('can wait for current animation to run n times if ' +
      'none specified', function() {
    var done = false;
    var Fake = function() {
      // This is supposed to mimic an Entity's currentAnim property.
      this.currentAnim = {
        loopCount: 0
      };
      this.chain = eventChain(this)
        .waitForAnimation(2)
        .then(function() {
          done = true;
        });
    };
    var f = new Fake();
    f.chain();
    assert(!done);
    f.chain();
    assert(!done);
    f.currentAnim.loopCount = 1;
    f.chain();
    f.chain();
    assert(!done);
    f.currentAnim.loopCount = 2;
    f.chain();
    f.chain();
    assert(done);
  });

  it('has a mixin function to add new event chain functions', function() {
    var context = {
      usedArg: null,
      addedStep: false
    };
    eventChain.mixin('mixinTest', function(context, steps) {
      return function(arg) {
        context.usedArg = arg;
        steps.push(function() {
          context.addedStep = true;
          steps.shift();
        });
        return this;
      };
    });
    var chain = eventChain(context)
      .mixinTest('argument');
    assert(context.usedArg === 'argument');
    chain();
    assert(context.addedStep);
  });

  it('allows chains to be re-used', function() {
    var one = false;
    var two = false;
    var three = false;
    var chain = eventChain()
      .then(function() {
        one = true;
      })
      .then(function() {
        two = true;
      })
      .then(function() {
        three = true;
      });
    assert(!one);
    assert(!two);
    assert(!three);
    chain();
    assert(one);
    assert(!two);
    assert(!three);
    chain();
    assert(two);
    assert(!three);
    chain();
    assert(three);

    chain.reset();
    one = false;
    two = false;
    three = false;

    chain();
    assert(one);
    assert(!two);
    assert(!three);
    chain();
    assert(two);
    assert(!three);
    chain();
    assert(three);
  });
});
