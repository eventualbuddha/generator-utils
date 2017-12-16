"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function* combine(generators) {
    switch (generators.length) {
        case 0:
            return;
        case 1:
            for (let value of generators[0]) {
                yield [value];
            }
            break;
        // case 2:
        //   let [left, right] = generators;
        //   let rightValues = Array.from(right);
        //   for (let leftValue of left) {
        //     for (let rightValue of rightValues) {
        //       yield [leftValue, rightValue];
        //     }
        //   }
        //   break;
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
exports.combine = combine;
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
function* concat(generators) {
    for (let generator of generators) {
        yield* generator;
    }
}
exports.concat = concat;
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
function* filter(generator, predicate) {
    for (let value of generator) {
        if (predicate(value)) {
            yield value;
        }
    }
}
exports.filter = filter;
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
function* filterMap(generator, transform) {
    for (let value of generator) {
        let skipped = false;
        function skip() { skipped = true; }
        let mappedValue = transform(value, skip);
        if (!skipped && mappedValue !== undefined) {
            yield mappedValue;
        }
    }
}
exports.filterMap = filterMap;
/**
 * Makes a generator from a generator producing other generators.
 *
 * @example
 *
 *   toArray(flatten(fromArray([range(2, 5), range(6,7))))
 *   // [2,3,4,5,6,7]
 */
function* flatten(generator) {
    for (let yieldedGenerator of generator) {
        yield* yieldedGenerator;
    }
}
exports.flatten = flatten;
/**
 * Calls a function for each value in a generator.
 *
 * @example
 *
 *   forEach(range(1, 4), console.log)
 *   // prints "1\n2\n3\n4\n"
 */
function forEach(generator, iterator) {
    for (let value of generator) {
        iterator(value);
    }
}
exports.forEach = forEach;
/**
 * Returns a generator yielding the values from the given array in order.
 *
 * @example
 *
 *   toArray(fromArray([1, 2, 3]))
 *   // [1, 2, 3]
 */
function* fromArray(array) {
    for (let value of array) {
        yield value;
    }
}
exports.fromArray = fromArray;
/**
 * Maps one generator to another by passing all values through a transformer.
 *
 * @example
 *
 *   toArray(map(range(2, 5), x => x * 2))
 *   // [4, 6, 8, 10]
 */
function* map(generator, transformer) {
    for (let value of generator) {
        yield transformer(value);
    }
}
exports.map = map;
/**
 * Returns a generator yielding values from min up to and including max.
 *
 * @example
 *
 *   toArray(range(8, 10))
 *   // [8, 9, 10]
 */
function* range(min, max) {
    for (let i = min; i <= max; i++) {
        yield i;
    }
}
exports.range = range;
/**
 * Returns up to the first count values of a generator.
 *
 * @example
 *
 *   take(range(10, 20), 3)
 *   // [10, 11, 12]
 */
function take(generator, count) {
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
exports.take = take;
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
function toArray(generator) {
    return Array.from(generator);
}
exports.toArray = toArray;
