# generator-utils

Utility functions for manipulating [generators] as lazy sequences.

## Install

Via npm:

```
$ npm install generator-utils
```

In the browser, use dist/generator-utils.js:

```html
<script type="application/javascript" src="generator-utils.js"></script>
```

## Usage

In a node.js environment, `require('generator-utils')`. In the browser it acts
as a UMD exporter with a global name of `GU`.

\# <b>combine</b>(generators)

Creates a new generator yielding all in-order combinations of values from
the given generators. All values from all generators will be read, so do not
use this with infinite generators.

```js
toArray(combine([range(0, 1), range(4, 5)]))
// [[0, 4], [0, 5], [1, 4], [1, 5]]
```


\# <b>concat</b>(generators)

Returns a generator yielding all the values from the given generators in
order. If any generators are infinite generators none of the values from
subsequent generators will be read.

```js
toArray(concat([range(0, 1), range(4, 5)]))
// [0, 1, 4, 5]
```


\# <b>filter</b>(generator, transform)

Returns a generator that yields values from another generator passing a
predicate. This may be used with infinite generators, though care should be
taken to ensure that the predicate does not return false for all values.

```js
toArray(filter(range(0, 5), x => x % 2 === 0))
// [0, 2, 4]
```


\# <b>filterMap</b>(generator, transform)

Combines `filter` and `map` in one transform. Instead of returning false,
filtering is done by calling the `skip` function passed as the second
argument to transform.

```js
toArray(filter(range(0, 5), (x, skip) => (x % 2 === 0) ? skip() : x * x))
// [1, 9, 25]
```


\# <b>forEach</b>(generator, iterator)

Calls a function for each value in a generator.

```js
forEach(range(1, 4), console.log)
// prints "1\n2\n3\n4\n"
```


\# <b>fromArray</b>(array)

Returns a generator yielding the values from the given array in order.

```js
toArray(fromArray([1, 2, 3]))
// [1, 2, 3]
```


\# <b>map</b>(map, transform)

Maps one generator to another by passing all values through a transformer.

```js
toArray(map(range(2, 5), x => x * 2))
// [4, 6, 8, 10]
```


\# <b>range</b>(min, max)

Returns a generator yielding values from min up to and including max.

```js
toArray(range(8, 10))
// [8, 9, 10]
```


\# <b>take</b>(generator, count)

Returns up to the first count values of a generator.

```js
take(range(10, 20), 3)
// [10, 11, 12]
```


\# <b>toArray</b>(generator)

Reads all values from a generator and returns an array containing them. Be
careful not to use this with infinite generators, as it will never return and
your program will eventually run out of memory.

```js
toArray(range(7, 9))
// [7, 8, 9]
```

[generators]: http://davidwalsh.name/es6-generators
