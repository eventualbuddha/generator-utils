import {
  combine,
  concat,
  copy,
  filter,
  filterMap,
  flatten,
  forEach,
  fromArray,
  map,
  range,
  take,
  toArray,
} from '..';

describe('generator-utils', () => {
  describe('combine', () => {
    it('returns an empty generator when given an empty list', () => {
      expect(Array.from(combine([]))).toStrictEqual([]);
    });

    it('returns a new generator yielding values wrapped in arrays when there is only one generator', () => {
      const nums = combine([range(0, 3)]);
      expect(Array.from(nums)).toStrictEqual([[0], [1], [2], [3]]);
    });

    it('returns a new generator yielding pairs of all values when given two generators', () => {
      const pairs = combine([range(0, 1), range(3, 4)]);
      expect(Array.from(pairs)).toStrictEqual([
        [0, 3],
        [0, 4],
        [1, 3],
        [1, 4],
      ]);
    });

    it('returns a new generator yielding tuples of all values when given many generators', () => {
      const tuples = combine([range(0, 1), range(3, 4), range(6, 7)]);
      expect(Array.from(tuples)).toStrictEqual([
        [0, 3, 6],
        [0, 3, 7],
        [0, 4, 6],
        [0, 4, 7],
        [1, 3, 6],
        [1, 3, 7],
        [1, 4, 6],
        [1, 4, 7],
      ]);
    });

    it('works with infinite generators', () => {
      const tuples = combine([naturalNumbers(), naturalNumbers()]);

      let i = 0;
      for (const tuple of tuples) {
        expect(tuple).toStrictEqual([0, i++]);

        if (i > 10000) {
          break;
        }
      }
    });
  });

  describe('concat', () => {
    it('returns an empty generator when given an empty list', () => {
      expect(Array.from(concat([]))).toStrictEqual([]);
    });

    it('yields values from the first generator in the list if there is only one', () => {
      const nums = concat([naturalNumbers()]);
      expect(take(nums, 3)).toStrictEqual([0, 1, 2]);
    });

    it('returns a new generator that yields the values from the first generator, second, etc', () => {
      const g = concat([range(0, 1), range(3, 4), range(6, 7)]);
      expect(Array.from(g)).toStrictEqual([0, 1, 3, 4, 6, 7]);
    });
  });

  describe('copy', () => {
    it('works with empty generators', () => {
      const copied = copy(fromArray([]));
      expect(Array.from(copied)).toStrictEqual([]);
    });

    it('works with infinite generators', () => {
      const copied = copy(naturalNumbers());
      expect(take(copied, 3)).toStrictEqual([0, 1, 2]);
    });
  });

  describe('filter', () => {
    it('allows skipping values', () => {
      const evens = filter(naturalNumbers(), function (n) {
        return n % 2 === 0;
      });

      expect(take(evens, 3)).toStrictEqual([0, 2, 4]);
    });
  });

  describe('filterMap', () => {
    it('allows skipping values and mapping at the same time', () => {
      const negativeOdds = filterMap(naturalNumbers(), function (n, skip) {
        if (n % 2 === 0) {
          skip();
        } else {
          return -n;
        }
      });

      expect(take(negativeOdds, 3)).toStrictEqual([-1, -3, -5]);
    });
  });

  describe('forEach', () => {
    it('calls the given iterator function with each generator value', () => {
      const values: Array<number> = [];

      forEach(range(2, 5), (value) => {
        values.push(value);
      });

      expect(values).toStrictEqual([2, 3, 4, 5]);
    });
  });

  describe('fromArray', () => {
    it('returns an empty generator from an empty array', () => {
      const nothing = fromArray([]);
      expect(Array.from(nothing)).toStrictEqual([]);
    });

    it('returns a generator with all the elements from the array in the same order', () => {
      const nums = [0, 4, 7, 9];
      const g = fromArray(nums);

      expect(Array.from(g)).toStrictEqual([0, 4, 7, 9]);
    });
  });

  describe('map', () => {
    it('allows changing each value of a generator into another value', () => {
      const doubleNaturalNumbers = map(naturalNumbers(), function (n) {
        return n * 2;
      });

      expect(take(doubleNaturalNumbers, 3)).toStrictEqual([0, 2, 4]);
    });
  });

  describe('flatten', () => {
    it('allows unwrapping generators to values', () => {
      const gens = [range(0, 0), range(2, 4)];
      const numbers = flatten(fromArray(gens));

      expect(Array.from(numbers)).toStrictEqual([0, 2, 3, 4]);
    });
  });

  describe('range', () => {
    it('returns a generator from N to M', () => {
      const zeroThroughThree = range(0, 3);

      expect(Array.from(zeroThroughThree)).toStrictEqual([0, 1, 2, 3]);
    });

    it('returns a generator yielding nothing if N > M', () => {
      const nothing = range(0, -1);
      expect(Array.from(nothing)).toStrictEqual([]);
    });

    it('returns a generator yielding only N if N == M', () => {
      const zero = range(0, 0);
      expect(Array.from(zero)).toStrictEqual([0]);
    });
  });

  describe('take', () => {
    it('returns the first N values from a generator', () => {
      const firstTen = take(naturalNumbers(), 10);
      expect(firstTen).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('returns all the values of a generator if it has less than N values', () => {
      const zeroThroughThree = range(0, 3);
      expect(take(zeroThroughThree, 5)).toStrictEqual([0, 1, 2, 3]);
    });
  });

  describe('toArray', () => {
    it('returns an array by consuming all of the available values in a generator', () => {
      const zeroThroughThree = range(0, 3);
      expect(toArray(zeroThroughThree)).toStrictEqual([0, 1, 2, 3]);
    });
  });

  function* naturalNumbers(): Iterable<number> {
    let value = 0;
    while (true) {
      yield value++;
    }
  }
});
