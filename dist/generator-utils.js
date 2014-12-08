(function() {
    "use strict";

    var $$index$$ = {
        get combine() {
            return $$index$$combine;
        },

        get concat() {
            return $$index$$concat;
        },

        get filter() {
            return $$index$$filter;
        },

        get filterMap() {
            return $$index$$filterMap;
        },

        get forEach() {
            return $$index$$forEach;
        },

        get fromArray() {
            return $$index$$fromArray;
        },

        get map() {
            return $$index$$map;
        },

        get range() {
            return $$index$$range;
        },

        get take() {
            return $$index$$take;
        },

        get toArray() {
            return $$index$$toArray;
        }
    };

    function $$index$$combine(generators) {
      switch (generators.length) {
        case 0:
          return {
            next: function() {
              return { value: null, done: true };
            }
          };

        case 1:
          return $$index$$map(generators[0], function(value) { return [value]; });

        case 2:
          var left = generators[0];
          var allRight = $$index$$toArray(generators[1]);
          var leftIteration;
          var rightOffset = 0;

          return {
            next: function next() {
              if (!leftIteration) {
                leftIteration = left.next();
              }

              if (leftIteration.done) {
                return leftIteration;
              }

              var nextRight = allRight[rightOffset++];

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
          return $$index$$map(
            $$index$$combine([generators[0], $$index$$combine(generators.slice(1))]),
            function(headAndTail) {
              var head = headAndTail[0];
              var tail = headAndTail[1].slice();
              tail.unshift(head);
              return tail;
            }
          );
      }
    }

    function $$index$$concat(generators) {
      switch (generators.length) {
        case 0:
          return {
            next: function() {
              return { value: null, done: true };
            }
          };

        case 1:
          return generators[0];

        default:
          var offset = 0;
          return {
            next: function next() {
              if (offset >= generators.length) {
                return { value: null, done: true };
              }

              var iteration = generators[offset].next();

              if (iteration.done) {
                offset++;
                return next();
              }

              return iteration;
            }
          };
      }
    }

    function $$index$$filter(generator, predicate) {
      return {
        next: function next() {
          var iteration = generator.next();

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

    function $$index$$filterMap(generator, transform) {
      return {
        next: function next() {
          var iteration = generator.next();

          if (iteration.done) {
            return iteration;
          }

          var skipped = false;
          function skip() { skipped = true; }

          iteration.value = transform(iteration.value, skip);

          if (skipped) {
            return next();
          }

          return iteration;
        }
      };
    }

    function $$index$$forEach(generator, iterator) {
      for (var iteration; !(iteration = generator.next()).done;) {
        iterator(iteration.value);
      }
    }

    function $$index$$fromArray(array) {
      var offset = 0;
      return {
        next: function() {
          if (offset < array.length) {
            return { value: array[offset++], done: false };
          } else {
            return { value: null, done: true };
          }
        }
      };
    }

    function $$index$$map(generator, transformer) {
      return {
        next: function next() {
          var iteration = generator.next();

          if (iteration.done) {
            return iteration;
          }

          return { value: transformer(iteration.value), done: false };
        }
      };
    }

    function $$index$$range(min, max) {
      var i = min;
      return {
        next: function() {
          if (i <= max) {
            return { value: i++, done: false };
          } else {
            return { value: null, done: true };
          }
        }
      };
    }

    function $$index$$take(generator, count) {
      var result = [];

      while (count-- > 0) {
        var iteration = generator.next();

        if (iteration.done) {
          break;
        }

        result.push(iteration.value);
      }

      return result;
    }

    function $$index$$toArray(generator) {
      var results = [];

      $$index$$forEach(generator, function(value) {
        results.push(value);
      });

      return results;
    }

    if (typeof module !== 'undefined' && module.exports) {
      module.exports = $$index$$;
    } else if (typeof define === 'function' && define.amd) {
      define(function() { return $$index$$; });
    } else if (typeof window !== 'undefined') {
      window.GU = $$index$$;
    } else if (this) {
      this.GU = $$index$$;
    }
}).call(this);

//# sourceMappingURL=generator-utils.js.map