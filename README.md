# impactjs-eventchain

A function to help script sequential events in [ImpactJS][].

[![Build Status](https://travis-ci.org/drhayes/impactjs-eventchain.png?branch=master)](https://travis-ci.org/drhayes/impactjs-eventchain)

## Overview

Use an EventChain where you would normally use `ig.system.tick` and a bunch of counters to try and time a scripted series of events. Each link in the chain is a step in your script.

A few concrete examples:

  * Spawn a monster every 5 seconds: `wait(5).then(function() { ig.game.spawnEntity...; }).repeat()`
  * Time a player respawn: player dies, wait 3 seconds, spawn player entity: `then(this.kill).wait(3).then(function() { ig.game.spawnEntity...; })`
  * Make a crumbling platform that wobbles every once in a while before `kill`ing itself: `wait(0.3).then(this.wobble).wait(0.3).then(this.wobble).wait(0.3).then(this.kill)`

Be sure to check out my [blog post][blogpost] explaining the rationale behind this class.

## Usage

`EventChain` has one optional parameter: the context in which it should execute the callbacks. That way, you can write `.then(this.kill)` and the chain will Do The Right Thing. If you don't need any special context, don't pass in that param.

You probably want to create an `EventChain` in the `init` method of an entity:

    init: function(x, y, settings) {
      this.parent(x, y, settings);
      this.chain = EventChain(this)
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
    },

And then invoke it in your `update` method like so:

    update: function() {
      this.chain();
    },

## Available Methods

Here's what the chain can do for you.

### `then`

    .then(callback)

The workhorse of an `EventChain`. When this link is reached your `callback` will be executed.

### `wait`

    .wait(numberOfSeconds)

Blocks the chain until `numberOfSeconds` has elapsed. Uses `ig.system.tick` to mark the passage of time.

### `during`

    .during(callback)

Execute the `callback` during a wait. If called in an `update`, for example, will be executed every frame during a `wait`.

### `repeat`

    .repeat()
    // or
    .repeat(numberOfTimes)

Repeats all previous links in the chain `numberOfTimes` times. If not given, will repeat itself forever. `repeat`s may be nested for multiplicative fun!

### `every`

    .every(numberOfSeconds, callback)

Much like `during`, only useful when used after a `wait`. Every `numberOfSeconds` seconds it will execute the `callback`.

### `orUntil`

    .orUntil(predicate)

`predicate` is a function that returns `true` or `false`. Only useful when used after a `wait`. Will "break" the wait if the `predicate` returns `true`.

## License

Copyright (c) 2013 David Hayes

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

  [impactjs]: http://impactjs.com
  [blogpost]: http://blog.davidrhayes.com/post/40585105928/event-chains
