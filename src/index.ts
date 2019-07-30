/**
 * Creates a new iterable yielding all in-order combinations of values from
 * the given iterables.
 *
 * @example
 *
 *   toArray(combine([range(0, 1), range(4, 5)]))
 *   // [[0, 4], [0, 5], [1, 4], [1, 5]]
 */
export function* combine<T>(iterables: Array<Iterable<T>>): Iterable<Array<T>> {
  switch (iterables.length) {
    case 0:
      return;

    case 1:
      for (const value of iterables[0]) {
        yield [value];
      }
      break;

    default: {
      const tails = copy(combine(iterables.slice(1)));

      for (const head of iterables[0]) {
        for (const tail of tails) {
          yield [head, ...tail];
        }
      }
      break;
    }
  }
}

/**
 * Returns an iterable yielding all the values from the given iterables in
 * order. If any iterables are infinite then none of the values from
 * subsequent iterables will be read.
 *
 * @example
 *
 *   toArray(concat([range(0, 1), range(4, 5)]))
 *   // [0, 1, 4, 5]
 */
export function* concat<T>(iterables: Array<Iterable<T>>): Iterable<T> {
  for (const iterable of iterables) {
    yield* iterable;
  }
}

/**
 * Returns an iterable that yields values from another iterable passing a
 * predicate.
 *
 * @example
 *
 *   toArray(filter(range(0, 5), x => x % 2 === 0))
 *   // [0, 2, 4]
 */
export function* filter<T>(
  iterable: Iterable<T>,
  predicate: (value: T) => boolean
): Iterable<T> {
  for (const value of iterable) {
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
export function* filterMap<T, U>(
  iterable: Iterable<T>,
  transform: (value: T, skip: () => void) => U | undefined
): Iterable<U> {
  for (const value of iterable) {
    let skipped = false;
    const mappedValue = transform(value, () => {
      skipped = true;
    });

    if (!skipped && mappedValue !== undefined) {
      yield mappedValue;
    }
  }
}

/**
 * Makes an iterable from an iterable producing other iterables.
 *
 * @example
 *
 *   toArray(flatten(fromArray([range(2, 5), range(6,7))))
 *   // [2,3,4,5,6,7]
 */
export function* flatten<T>(iterable: Iterable<Iterable<T>>): Iterable<T> {
  for (const yieldedIterable of iterable) {
    yield* yieldedIterable;
  }
}

/**
 * Calls a function for each value in an iterable.
 *
 * @example
 *
 *   forEach(range(1, 4), console.log)
 *   // prints "1\n2\n3\n4\n"
 */
export function forEach<T>(
  iterable: Iterable<T>,
  callback: (value: T) => void
): void {
  for (const value of iterable) {
    callback(value);
  }
}

/**
 * Returns an iterable yielding the values from the given array in order.
 *
 * @example
 *
 *   toArray(fromArray([1, 2, 3]))
 *   // [1, 2, 3]
 */
export function* fromArray<T>(array: Array<T>): Iterable<T> {
  for (const value of array) {
    yield value;
  }
}

/**
 * Maps one iterable to another by passing all values through a transformer.
 *
 * @example
 *
 *   toArray(map(range(2, 5), x => x * 2))
 *   // [4, 6, 8, 10]
 */
export function* map<T, U>(
  iterable: Iterable<T>,
  transformer: (value: T) => U
): Iterable<U> {
  for (const value of iterable) {
    yield transformer(value);
  }
}

/**
 * Returns an iterable yielding values from min up to and including max.
 *
 * @example
 *
 *   toArray(range(8, 10))
 *   // [8, 9, 10]
 */
export function* range(min: number, max: number): Iterable<number> {
  for (let i = min; i <= max; i++) {
    yield i;
  }
}

/**
 * Returns up to the first count values of an iterable.
 *
 * @example
 *
 *   take(range(10, 20), 3)
 *   // [10, 11, 12]
 */
export function take<T>(iterable: Iterable<T>, count: number): Array<T> {
  const result = [];
  const iterator = iterable[Symbol.iterator]();

  while (count-- > 0) {
    const iteration = iterator.next();

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
 * Reads all values from an iterable and returns an array containing them. Be
 * careful not to use this with infinite iterables, as it will never return and
 * your program will eventually run out of memory.
 *
 * @example
 *
 *   toArray(range(7, 9))
 *   // [7, 8, 9]
 */
export function toArray<T>(iterable: Iterable<T>): Array<T> {
  return Array.from(iterable);
}

/**
 * Create a new iterable that, whenever it is iterated over, yields the same
 * values from `iterable` in order.
 *
 * @example
 *
 *   const copied = copy(range(0, 2));
 *   const notCopied = range(0, 2);
 *
 *   // Consumes the underlying iterable as-is…
 *   toArray(copied);
 *   // [0, 1, 2]
 *
 *   // …but caches the results to be replayed.
 *   toArray(copied);
 *   // [0, 1, 2]
 *
 *   // Consumes the iterable…
 *   toArray(notCopied);
 *   // [0, 1, 2]
 *
 *   // …and has nothing left.
 *   toArray(notCopied);
 *   // []
 */
export function copy<T>(iterable: Iterable<T>): Iterable<T> {
  const values: Array<T> = [];
  const indexes: Array<number> = [];
  const iterators: Array<Iterator<T>> = [];
  let done = false;
  let maxIndex = Infinity;

  function getIteratorResultAtIndex(index: number): IteratorResult<T> {
    while (values.length <= index) {
      if (!done) {
        const valueArray = take(iterable, 1);

        if (valueArray.length === 0) {
          done = true;
          maxIndex = values.length - 1;
        }

        values.push(valueArray[0]);
      }
    }

    return {
      done: index > maxIndex,
      value: values[index]
    };
  }

  return {
    [Symbol.iterator](): Iterator<T> {
      const id = iterators.length;

      indexes[id] = 0;
      iterators[id] = {
        next(): IteratorResult<T> {
          const result = getIteratorResultAtIndex(indexes[id]++);
          return result;
        }
      };

      return iterators[id];
    }
  };
}
