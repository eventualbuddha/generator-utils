/**
 * Creates a new generator yielding all in-order combinations of values from
 * the given generators. All values from all generators will be read, so do not
 * use this with infinite generators.
 *
 * @example
 *
 *   toArray(combine([range(0, 1), range(4, 5)]))
 *   // [[0, 4], [0, 5], [1, 4], [1, 5]]
 *
 * @param {{next: (function(): {value: ?T, done: boolean})}[]} generators
 * @returns {{next: (function(): {value: ?T, done: boolean})}}
 * @template T
 */
export function combine(generators) {
  switch (generators.length) {
    case 0:
      return {
        next() {
          return { value: null, done: true };
        }
      };

    case 1:
      return map(generators[0], value => [value]);

    case 2:
      let left = generators[0];
      let allRight = toArray(generators[1]);
      let leftIteration;
      let rightOffset = 0;

      return {
        next: function next() {
          if (!leftIteration) {
            leftIteration = left.next();
          }

          if (leftIteration.done) {
            return leftIteration;
          }

          let nextRight = allRight[rightOffset++];

          if (nextRight) {
            return { value: [leftIteration.value, nextRight], done: false };
          } else {
            leftIteration = null;
            rightOffset = 0;
            return next();
          }
        }
      };

    default:
      return map(
        combine([generators[0], combine(generators.slice(1))]),
        ([head, tail]) => [head, ...tail]
      );
  }
}

/**
 * Returns a generator yielding all the values from the given generators in
 * order. If any generators are infinite generators none of the values from
 * subsequent generators will be read.
 *
 * @example
 *
 *   toArray(concat([range(0, 1), range(4, 5)]))
 *   // [0, 1, 4, 5]
 *
 * @param {{next: (function(): {value: ?T, done: boolean})}[]} generators
 * @returns {{next: (function(): {value: ?T, done: boolean})}}
 * @template T
 */
export function concat(generators) {
  switch (generators.length) {
    case 0:
      return {
        next() {
          return { value: null, done: true };
        }
      };

    case 1:
      return generators[0];

    default:
      let offset = 0;
      return {
        next: function next() {
          if (offset >= generators.length) {
            return { value: null, done: true };
          }

          let iteration = generators[offset].next();

          if (iteration.done) {
            offset++;
            return next();
          }

          return iteration;
        }
      };
  }
}

/**
 * Returns a generator that yields values from another generator passing a
 * predicate. This may be used with infinite generators, though care should be
 * taken to ensure that the predicate does not return false for all values.
 *
 * @example
 *
 *   toArray(filter(range(0, 5), x => x % 2 === 0))
 *   // [0, 2, 4]
 *
 * @param {{next: (function(): {value: ?T, done: boolean})}} generator
 * @param {function(T): boolean} predicate
 * @returns {{next: (function(): {value: ?T, done: boolean})}}
 * @template T
 */
export function filter(generator, predicate) {
  return {
    next: function next() {
      let iteration = generator.next();

      if (iteration.done) {
        return iteration;
      }

      if (!predicate(iteration.value)) {
        return next();
      }

      return iteration;
    }
  };
}

/**
 * Combines `filter` and `map` in one transform. Instead of returning false,
 * filtering is done by calling the `skip` function passed as the second
 * argument to transform.
 *
 * @example
 *
 *   toArray(filter(range(0, 5), (x, skip) => (x % 2 === 0) ? skip() : x * x))
 *   // [1, 9, 25]
 *
 * @param {{next: (function(): {value: ?T, done: boolean})}} generator
 * @param {function(T, function()): ?T} transform
 * @returns {{next: (function(): {value: ?T, done: boolean})}}
 * @template T
 */
export function filterMap(generator, transform) {
  return {
    next: function next() {
      var iteration = generator.next();

      if (iteration.done) {
        return iteration;
      }

      let skipped = false;
      function skip() { skipped = true; }

      iteration.value = transform(iteration.value, skip);

      if (skipped) {
        return next();
      }

      return iteration;
    }
  };
}

/**
 * Makes a generator from a generator producing other generators.
 *
 * @example
 *
 *   toArray(flatten(fromArray([range(2, 5), range(6,7))))
 *   // [2,3,4,5,6,7]
 *
 * @param {{next: (function(): {value: ?{next: (function(): {value: ?T, done: boolean})}, done: boolean})}} generator
 * @returns {{next: (function(): {value: ?T, done: boolean})}}
 * @template T
 */
export function flatten(generator) {
  let needsGenerator = true;
  let subGenerator;
  return {
    next() {
      for (;;) {
        if (needsGenerator) {
          let subIterator = generator.next();
          if (subIterator.done) {
            return { value: null, done: true };
          }
          subGenerator = subIterator.value;
          needsGenerator = false;
        }
        let iteration = subGenerator.next();
        if (iteration.done) {
          needsGenerator = true;
        } else {
          return iteration;
        }
      }
    }
  };
}

/**
 * Calls a function for each value in a generator.
 *
 * @example
 *
 *   forEach(range(1, 4), console.log)
 *   // prints "1\n2\n3\n4\n"
 *
 * @param {{next: (function(): {value: ?T, done: boolean})}} generator
 * @param {function(T)} iterator
 * @template T
 */
export function forEach(generator, iterator) {
  for (let iteration; !(iteration = generator.next()).done;) {
    iterator(iteration.value);
  }
}

/**
 * Returns a generator yielding the values from the given array in order.
 *
 * @example
 *
 *   toArray(fromArray([1, 2, 3]))
 *   // [1, 2, 3]
 *
 * @param {T[]} array
 * @returns {{next: (function(): {value: ?T, done: boolean})}}
 * @template T
 * @private
 */
export function fromArray(array) {
  let offset = 0;
  return {
    next() {
      if (offset < array.length) {
        return { value: array[offset++], done: false };
      } else {
        return { value: null, done: true };
      }
    }
  };
}

/**
 * Maps one generator to another by passing all values through a transformer.
 *
 * @example
 *
 *   toArray(map(range(2, 5), x => x * 2))
 *   // [4, 6, 8, 10]
 *
 * @param {{next: (function(): {value: ?T, done: boolean})}} generator
 * @param {function(T, function()=): U} transformer
 * @returns {{next: (function(): {value: ?U, done: boolean})}}
 * @template T
 * @template U
 */
export function map(generator, transformer) {
  return {
    next() {
      let iteration = generator.next();

      if (iteration.done) {
        return iteration;
      }

      return { value: transformer(iteration.value), done: false };
    }
  };
}

/**
 * Returns a generator yielding values from min up to and including max.
 *
 * @example
 *
 *   toArray(range(8, 10))
 *   // [8, 9, 10]
 *
 * @param {number} min
 * @param {number} max
 * @returns {{next: (function(): {value: ?number, done: boolean})}}
 */
export function range(min, max) {
  let i = min;
  return {
    next() {
      if (i <= max) {
        return { value: i++, done: false };
      } else {
        return { value: null, done: true };
      }
    }
  };
}

/**
 * Returns up to the first count values of a generator.
 *
 * @example
 *
 *   take(range(10, 20), 3)
 *   // [10, 11, 12]
 *
 * @param generator
 * @param count
 * @returns {Array}
 */
export function take(generator, count) {
  let result = [];

  while (count-- > 0) {
    let iteration = generator.next();

    if (iteration.done) {
      break;
    }

    result.push(iteration.value);
  }

  return result;
}

/**
 * Reads all values from a generator and returns an array containing them. Be
 * careful not to use this with infinite generators, as it will never return and
 * your program will eventually run out of memory.
 *
 * @example
 *
 *   toArray(range(7, 9))
 *   // [7, 8, 9]
 *
 * @param {{next: (function(): {value: ?T, done: boolean})}} generator
 * @returns {T[]}
 * @template T
 */
export function toArray(generator) {
  let results = [];
  forEach(generator, value => results.push(value));
  return results;
}
