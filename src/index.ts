/**
 * Creates a new generator yielding all in-order combinations of values from
 * the given generators. All values from all generators will be read, so do not
 * use this with infinite generators.
 *
 * @example
 *
 *   toArray(combine([range(0, 1), range(4, 5)]))
 *   // [[0, 4], [0, 5], [1, 4], [1, 5]]
 */
export function *combine<T>(generators: Array<IterableIterator<T>>): IterableIterator<Array<T>> {
  switch (generators.length) {
    case 0:
      return;

    case 1:
      for (let value of generators[0]) {
        yield [value];
      }
      break;

    default:
      let [head, ...tail] = generators;
      let headValues = Array.from(head);
      let tailCombinations = Array.from(combine(tail));

      for (let headValue of headValues) {
        for (let tailCombination of tailCombinations) {
          yield [headValue, ...tailCombination];
        }
      }
      break;
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
 */
export function *concat<T>(generators: Array<IterableIterator<T>>): IterableIterator<T> {
  for (let generator of generators) {
    yield *generator;
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
 */
export function *filter<T>(generator: IterableIterator<T>, predicate: (value: T) => boolean) {
  for (let value of generator) {
    if (predicate(value)) {
      yield value;
    }
  }
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
 */
export function *filterMap<T, U>(generator: IterableIterator<T>, transform: (value: T, skip: () => void) => U | undefined): Iterator<U> {
  for (let value of generator) {
    let skipped = false;
    function skip() { skipped = true; }

    let mappedValue = transform(value, skip);

    if (!skipped && mappedValue !== undefined) {
      yield mappedValue;
    }
  }
}

/**
 * Makes a generator from a generator producing other generators.
 *
 * @example
 *
 *   toArray(flatten(fromArray([range(2, 5), range(6,7))))
 *   // [2,3,4,5,6,7]
 */
export function *flatten<T>(generator: IterableIterator<IterableIterator<T>>): IterableIterator<T> {
  for (let yieldedGenerator of generator) {
    yield *yieldedGenerator;
  }
}

/**
 * Calls a function for each value in a generator.
 *
 * @example
 *
 *   forEach(range(1, 4), console.log)
 *   // prints "1\n2\n3\n4\n"
 */
export function forEach<T>(generator: IterableIterator<T>, iterator: (value: T) => void) {
  for (let value of generator) {
    iterator(value);
  }
}

/**
 * Returns a generator yielding the values from the given array in order.
 *
 * @example
 *
 *   toArray(fromArray([1, 2, 3]))
 *   // [1, 2, 3]
 */
export function *fromArray<T>(array: Array<T>): IterableIterator<T> {
  for (let value of array) {
    yield value;
  }
}

/**
 * Maps one generator to another by passing all values through a transformer.
 *
 * @example
 *
 *   toArray(map(range(2, 5), x => x * 2))
 *   // [4, 6, 8, 10]
 */
export function *map<T, U>(generator: IterableIterator<T>, transformer: (value: T) => U): IterableIterator<U> {
  for (let value of generator) {
    yield transformer(value);
  }
}

/**
 * Returns a generator yielding values from min up to and including max.
 *
 * @example
 *
 *   toArray(range(8, 10))
 *   // [8, 9, 10]
 */
export function *range(min: number, max: number): IterableIterator<number> {
  for (let i = min; i <= max; i++) {
    yield i;
  }
}

/**
 * Returns up to the first count values of a generator.
 *
 * @example
 *
 *   take(range(10, 20), 3)
 *   // [10, 11, 12]
 */
export function take<T>(generator: IterableIterator<T>, count: number): Array<T> {
  let result = [];

  while (count-- > 0) {
    let iteration = generator.next();

    if (iteration.done) {
      if (iteration.value !== undefined) {
        result.push(iteration.value);
      }
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
 */
export function toArray<T>(generator: IterableIterator<T>): Array<T> {
  return Array.from(generator);
}
