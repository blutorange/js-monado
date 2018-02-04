Iterators are great, and works well with Sets and Maps, eg. `(new Map()).entries()`.
Until I realized you can't really do much with iterators, and having to do manual iterations
all the time is a pain. Methods and their names inspired by JavaScript, Java stream API
and ruby's enumerables.

Let's try parsing a set of strings as JSON:

```javascript
const input = new Set(["9","9a"])

// With streams, returns [9,0]
stream(input).try(JSON.parse).onError(console.error).orElse(0).toArray()

// With vanilla JS, returns [9,0]
Array.from(function*(data) {
    for (let item of data) {
        try {
            yield JSON.parse(item)
        }
        catch (e) {
            console.error(e)
            yield 0
        }
    }
}(input))
```

# Docs

See the directory `doc` for documentation on all methods.

```javascript
const lib = require("streams");
```

This returns an object with the following entries:

* [Collectors](http://htmlpreview.github.io/?https://github.com/blutorange/js-streams/blob/master/doc/modules/_collectors_.html)
* [StreamFactory](http://htmlpreview.github.io/?https://github.com/blutorange/js-streams/blob/master/doc/modules/_streamfactory_.html)
* [Methods](http://htmlpreview.github.io/?https://github.com/blutorange/js-streams/blob/master/doc/modules/_methods_.html)
* [monkeyPatch](http://htmlpreview.github.io/?https://github.com/blutorange/js-streams/blob/master/doc/modules/_monkeypatch_.html)
* [TryFactory](http://htmlpreview.github.io/?https://github.com/blutorange/js-streams/blob/master/doc/modules/_try_.html#tryfactory)

# Install

You know the drill.

```sh
npm install --save streams@https://github.com/blutorange/js-streams
```

Or use the standalone in `dist/streams.js`. With node it simply exports itself, within a browser it registers globally as `window.Streams`.

# Usage

```javascript
const lib = require("streams");
const times = lib.InplaceStreamFactory.times;
times(100, 0, 2).map(x => x*x-2).map(Math.abs).min(); // 1.41
```

There are three different ways of using the stream methods:

# Shortcut

If you do not like to write much:

```javascript
const { stream } = require("streams");
stream([1,2,3]).map(...).filter(...).limit(1).group(...);
```

## Standalone methods

All methods are available as stand-alone functions taking an iterable
as their first argument.

```javascript
const { Collectors, Methods: {map, filter, collect} } = require("streams");

const iterable = [1,2,3];

map(iterable, x => 2*x); // => Iterable[2,4,6]

filter(iterable, x => x > 2); // => Iterable[4,6]

collect(iterable, Collectors.join()); // => "4,6"
```

## Stream wrapper

For easier chaining, there are also two wrapper classes for
the stand-alone functions.

The inplace stream comes with less overhead, but is not typesafe. This
is most likely irrelevant unless you are using TypeScript.

```javascript
const { stream } = require("streams");

stream([1,2,3]).map(x=>2*x).filter(x=>x>2).concat([7,9]).join(",");
// => "4,6,7,9"
```

The typesafe streams creates new stream instances for type safety. The overhead should be marginal, however.

```javascript
const stream = require("streams").TypesafeStreamFactory.stream;

stream([1,2,3]).map(x=>2*x).filter(x=>x>2).concat([7,9]).join(",");
// => "4,6,7,9"
```

Once a stream is chained, it must not be used anymore, or an error is thrown:

```javascript
const stream = require("streams").TypesafeStreamFactory.stream;

const s = stream([1,2,3]);

s.map(x => x * x); // => Stream[1,4,9]

// Error: "Stream was already consumed."
s.filter(x => x > 2);
```

Similarly for inplace streams: 

```javascript
const stream = require("streams").InplaceStreamFactory.stream;

const s = stream([1,2,3]);

s.map(x => x * x); // => Stream[2,4,6]

s.filter(x => x > 2); // => Stream[4,6]

s.join() // => "46"

s.join() // Error: "Stream was already consumed."
```

## Monkey patching

I would not recommend it, but you can monkey-patch a `stream` method to objects:

```javascript
require("streams").monkeypatch();

[1,2,3].stream().map(x => x + 4).toSet();
// => Set[2,4,6]

"foobar".stream().filter(x => x > "d").toArray();
// => ["f", "o", "o", "r"]

new Set([1,2,3]).stream();
// => Stream[1,2,3]

new Map(["foo", 3], ["bar", 9]).stream();
// => Stream[ ["foo", 3], ["bar", 9] ]

({foo: 3, bar: 9}).stream();
// => Stream[ ["foo", 3], ["bar", 9] ]
```

# Catching errors

Use the `try` method to handle errors during stream operations.

```javascript
stream(json1, json2, json3).try(JSON.parse);

// same as the above
stream(json1, json2, json3).map(x => lib.TryFactory.of(() => JSON.parse(x)))
```

This returns a stream with `Try` objects encapsulating the error, if one occured.

To get the values of the successful operations:

```javascript
// Logs errors to the console, removes them from the stream, and
// returns successfully parsed JSON objects.
stream(json1, json2, json3).try(JSON.parse).discardError().toArray()
```

To get the values of the successful and failed operations:

```javascript
const result = stream(json1, json2, json3).try(JSON.parse).partition(x => x.success);

result.false.forEach(error => { ... }) // do something with the errors

result.true.forEach(value => { ... }) // do something with the succesful values
```

To provide a default for failed operations:

```javascript
stream(json1, json2, json3).try(JSON.parse).map(x => x.orElse(undefined)); // JSON object or undefined.
```

# Build

Make sure you fetch all dependencies

```sh
npm install
```

Then run

```sh
npm run build
```

This may fail on Windows, who but a rabbit knows...