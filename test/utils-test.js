"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const assert = require("assert");
describe('generator-utils', function () {
    describe('combine', function () {
        it('returns an empty generator when given an empty list', function () {
            assert.ok(index_1.combine([]).next().done);
        });
        it('returns a new generator yielding values wrapped in arrays when there is only one generator', function () {
            const nums = index_1.combine([index_1.range(0, 3)]);
            assert.deepEqual(nums.next().value, [0]);
            assert.deepEqual(nums.next().value, [1]);
            assert.deepEqual(nums.next().value, [2]);
            assert.deepEqual(nums.next().value, [3]);
        });
        it('returns a new generator yielding pairs of all values when given two generators', function () {
            const pairs = index_1.combine([index_1.range(0, 1), index_1.range(3, 4)]);
            assert.deepEqual(pairs.next().value, [0, 3]);
            assert.deepEqual(pairs.next().value, [0, 4]);
            assert.deepEqual(pairs.next().value, [1, 3]);
            assert.deepEqual(pairs.next().value, [1, 4]);
            assert.ok(pairs.next().done);
        });
        it('returns a new generator yielding tuples of all values when given many generators', function () {
            const tuples = index_1.combine([index_1.range(0, 1), index_1.range(3, 4), index_1.range(6, 7)]);
            assert.deepEqual(tuples.next().value, [0, 3, 6]);
            assert.deepEqual(tuples.next().value, [0, 3, 7]);
            assert.deepEqual(tuples.next().value, [0, 4, 6]);
            assert.deepEqual(tuples.next().value, [0, 4, 7]);
            assert.deepEqual(tuples.next().value, [1, 3, 6]);
            assert.deepEqual(tuples.next().value, [1, 3, 7]);
            assert.deepEqual(tuples.next().value, [1, 4, 6]);
            assert.deepEqual(tuples.next().value, [1, 4, 7]);
            assert.ok(tuples.next().done);
        });
    });
    describe('concat', function () {
        it('returns an empty generator when given an empty list', function () {
            assert.ok(index_1.concat([]).next().done);
        });
        it('yields values from the first generator in the list if there is only one', function () {
            const nums = index_1.concat([naturalNumbers()]);
            assert.strictEqual(nums.next().value, 0);
            assert.strictEqual(nums.next().value, 1);
            assert.strictEqual(nums.next().value, 2);
        });
        it('returns a new generator that yields the values from the first generator, second, etc', function () {
            const g = index_1.concat([index_1.range(0, 1), index_1.range(3, 4), index_1.range(6, 7)]);
            assert.strictEqual(g.next().value, 0);
            assert.strictEqual(g.next().value, 1);
            assert.strictEqual(g.next().value, 3);
            assert.strictEqual(g.next().value, 4);
            assert.strictEqual(g.next().value, 6);
            assert.strictEqual(g.next().value, 7);
            assert.ok(g.next().done);
        });
    });
    describe('filter', function () {
        it('allows skipping values', function () {
            const evens = index_1.filter(naturalNumbers(), function (n) {
                return n % 2 === 0;
            });
            assert.strictEqual(evens.next().value, 0);
            assert.strictEqual(evens.next().value, 2);
            assert.strictEqual(evens.next().value, 4);
        });
    });
    describe('filterMap', function () {
        it('allows skipping values and mapping at the same time', function () {
            const negativeOdds = index_1.filterMap(naturalNumbers(), function (n, skip) {
                if (n % 2 === 0) {
                    skip();
                }
                else {
                    return -n;
                }
            });
            assert.strictEqual(negativeOdds.next().value, -1);
            assert.strictEqual(negativeOdds.next().value, -3);
            assert.strictEqual(negativeOdds.next().value, -5);
        });
    });
    describe('forEach', function () {
        it('calls the given iterator function with each generator value', function () {
            let values = [];
            index_1.forEach(index_1.range(2, 5), value => {
                values.push(value);
            });
            assert.deepEqual(values, [2, 3, 4, 5]);
        });
    });
    describe('fromArray', function () {
        it('returns an empty generator from an empty array', function () {
            const nothing = index_1.fromArray([]);
            assert.ok(nothing.next().done);
        });
        it('returns a generator with all the elements from the array in the same order', function () {
            const nums = [0, 4, 7, 9];
            const g = index_1.fromArray(nums);
            assert.strictEqual(g.next().value, 0);
            assert.strictEqual(g.next().value, 4);
            assert.strictEqual(g.next().value, 7);
            assert.strictEqual(g.next().value, 9);
            assert.ok(g.next().done);
        });
    });
    describe('map', function () {
        it('allows changing each value of a generator into another value', function () {
            const doubleNaturalNumbers = index_1.map(naturalNumbers(), function (n) {
                return n * 2;
            });
            assert.strictEqual(doubleNaturalNumbers.next().value, 0);
            assert.strictEqual(doubleNaturalNumbers.next().value, 2);
            assert.strictEqual(doubleNaturalNumbers.next().value, 4);
        });
    });
    describe('flatten', function () {
        it('allows unwrapping generators to values', function () {
            const gens = [index_1.range(0, 0), index_1.range(2, 4)];
            const numbers = index_1.flatten(index_1.fromArray(gens));
            assert.strictEqual(numbers.next().value, 0);
            assert.strictEqual(numbers.next().value, 2);
            assert.strictEqual(numbers.next().value, 3);
            assert.strictEqual(numbers.next().value, 4);
            assert.strictEqual(numbers.next().done, true);
        });
    });
    describe('range', function () {
        it('returns a generator from N to M', function () {
            const zeroThroughThree = index_1.range(0, 3);
            assert.strictEqual(zeroThroughThree.next().value, 0);
            assert.strictEqual(zeroThroughThree.next().value, 1);
            assert.strictEqual(zeroThroughThree.next().value, 2);
            assert.strictEqual(zeroThroughThree.next().value, 3);
            assert.ok(zeroThroughThree.next().done);
        });
        it('returns a generator yielding nothing if N > M', function () {
            const nothing = index_1.range(0, -1);
            assert.ok(nothing.next().done);
        });
        it('returns a generator yielding only N if N == M', function () {
            const zero = index_1.range(0, 0);
            assert.strictEqual(zero.next().value, 0);
            assert.ok(zero.next().done);
        });
    });
    describe('take', function () {
        it('returns the first N values from a generator', function () {
            const firstTen = index_1.take(naturalNumbers(), 10);
            assert.deepEqual(firstTen, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });
        it('returns all the values of a generator if it has less than N values', function () {
            const zeroThroughThree = index_1.range(0, 3);
            assert.deepEqual(index_1.take(zeroThroughThree, 5), [0, 1, 2, 3]);
        });
    });
    describe('toArray', function () {
        it('returns an array by consuming all of the available values in a generator', function () {
            const zeroThroughThree = index_1.range(0, 3);
            assert.deepEqual(index_1.toArray(zeroThroughThree), [0, 1, 2, 3]);
        });
    });
    function* naturalNumbers() {
        let value = 0;
        while (true) {
            yield value++;
        }
    }
});
