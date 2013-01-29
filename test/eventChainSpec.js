/*global require: true, global: true, describe: true, beforeEach: true,
  it: true, EventChain: true */
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

// The module declares EventChain globally.
var EventChain = require('../eventChain.js').EventChain;

describe('eventChain', function() {
  var chain;

  beforeEach(function() {
    // Reset ig namespace state.
    ig.system.tick = 0;
    // Instantiate a new chain.
    chain = EventChain();
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
    ig.system.tick = .1;
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
});
