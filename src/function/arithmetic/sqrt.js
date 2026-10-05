import { factory } from '../../utils/factory.js'

const name = 'sqrt'
const dependencies = ['config', 'typed', 'Complex', 'Fraction']

export const createSqrt = /* #__PURE__ */ factory(name, dependencies, ({ config, typed, Complex, Fraction }) => {
  /**
   * Calculate the square root of a value.
   *
   * For matrices, if you want the matrix square root of a square matrix,
   * use the `sqrtm` function. If you wish to apply `sqrt` elementwise to
   * a matrix M, use `math.map(M, math.sqrt)`.
   *
   * Syntax:
   *
   *    math.sqrt(x)
   *
   * Examples:
   *
   *    math.sqrt(25)                // returns 5
   *    math.square(5)               // returns 25
   *    math.sqrt(-4)                // returns Complex 2i
   *
   * See also:
   *
   *    square, multiply, cube, cbrt, sqrtm
   *
   * @param {number | BigNumber | Complex | Fraction | Unit} x
   *            Value for which to calculate the square root.
   * @return {number | BigNumber | Complex | Fraction | Unit}
   *            Returns the square root of `x`
   */
  return typed('sqrt', {
    number: _sqrtNumber,

    Complex: function (x) {
      return x.sqrt()
    },

    BigNumber: function (x) {
      if (!x.isNegative() || config.predictable) {
        return x.sqrt()
      } else {
        // negative value -> downgrade to number to do complex value computation
        return _sqrtNumber(x.toNumber())
      }
    },

    Fraction: function (x) {
      if (x.s < 0) {
        // negative value -> downgrade to number to do complex value computation
        return _sqrtNumber(x.valueOf())
      }

      const result = x.pow(new Fraction(1, 2))

      if (result != null) {
        return result
      }

      if (config.predictable) {
        throw new Error('Result of sqrt is non-rational and cannot be expressed as a fraction')
      } else {
        // downgrade to number, like the fallback of pow for fractions
        return _sqrtNumber(x.valueOf())
      }
    },

    Unit: function (x) {
      // Someday will work for complex units when they are implemented
      return x.pow(0.5)
    }

  })

  /**
   * Calculate sqrt for a number
   * @param {number} x
   * @returns {number | Complex} Returns the square root of x
   * @private
   */
  function _sqrtNumber (x) {
    if (isNaN(x)) {
      return NaN
    } else if (x >= 0 || config.predictable) {
      return Math.sqrt(x)
    } else {
      return new Complex(x, 0).sqrt()
    }
  }
})
