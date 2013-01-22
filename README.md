impactjs-eventchain
===================

A function to help script sequential events in [ImpactJS][].

[![Build Status](https://travis-ci.org/drhayes/impactjs-eventchain.png?branch=master)](undefined)

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

Don't forget that `this` doesn't work within those callbacks as it refers to the EventChain instance itself! You'll need to do something like this to get around that:

    var self = this;
    var chain = new EventChain()
      .wait(10)
      .then(function() {
        self.kill();
        });

License
-------

Copyright (c) 2013 David Hayes

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

  [impactjs]: http://impactjs.com
  [blogpost]: http://blog.davidrhayes.com/post/40585105928/event-chains
