import * as GU from './index';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GU;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return GU; });
} else if (typeof window !== 'undefined') {
  window.GU = GU;
} else if (this) {
  this.GU = GU;
}
