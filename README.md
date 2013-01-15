impactjs-eventchain
===================

A function to help script sequential events in [ImpactJS][].

Overview
--------

Be sure to check out my [blog post][blogpost] explaining the rationale behind this class.

Because I got sick of littering my ImpactJS entities with timing code in order to script complex behaviors, I wrote a collection of functions that can time everything for me.

The intent is the event chain gets invoked every frame in an entity's `update` method.

Usage
-----

    var chain = new EventChain()
      .wait(10)           // Wait for 10 seconds...
      .then(function() {  // ...then spawn a baddie...
          ig.game.spawnEntity('EntityKillerThing', 10, 10);
        })
      .repeat(3)          // ...repeat that 3 times...
      .wait(5)            // ...wait some more...
      .then(function() {  // ...then spawn a lesser baddie...
          ig.game.spawnEntity('EntityWeakerThing', 10, 10);
        })
      .repeat();         // ...and repeat the whole thing forever.

  [impactjs]: http://impactjs.com
  [blogpost]: http://blog.davidrhayes.com/post/40585105928/event-chains
