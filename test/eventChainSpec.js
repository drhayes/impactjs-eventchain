var assert = require('assert');

// Fake the Impact global namespace with good enough definitions.
global.ig = {
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
require('../eventChain.js');

describe('eventChain', function() {
  var chain;

  beforeEach(function() {
    // Reset ig namespace state.
    ig.system.tick = 0;
    // Instantiate a new chain.
    chain = new EventChain();
  });

  it('defines some functions', function() {
    var operators = ['then', 'wait', 'during', 'repeat', 'every'];
    operators.forEach(function(operator) {
      assert(chain[operator]);
    });
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
});
