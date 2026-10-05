import { factory } from '../../utils/factory.js'
import { createMatAlgo01xDSid } from '../../type/matrix/utils/matAlgo01xDSid.js'
import { createMatAlgo02xDS0 } from '../../type/matrix/utils/matAlgo02xDS0.js'
import { createMatAlgo06xS0S0 } from '../../type/matrix/utils/matAlgo06xS0S0.js'
import { createMatAlgo11xS0s } from '../../type/matrix/utils/matAlgo11xS0s.js'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.js'
import { nthRootNumber } from '../../plain/number/index.js'

const name = 'nthRoot'
const dependencies = [
  'config',
  'typed',
  'matrix',
  'equalScalar',
  'BigNumber',
  'Fraction',
  'concat'
]

export const createNthRoot = /* #__PURE__ */ factory(name, dependencies, ({ config, typed, matrix, equalScalar, BigNumber, Fraction, concat }) => {
  const matAlgo01xDSid = createMatAlgo01xDSid({ typed })
  const matAlgo02xDS0 = createMatAlgo02xDS0({ typed, equalScalar })
  const matAlgo06xS0S0 = createMatAlgo06xS0S0({ typed, equalScalar })
  const matAlgo11xS0s = createMatAlgo11xS0s({ typed, equalScalar })
  const matrixAlgorithmSuite = createMatrixAlgorithmSuite({ typed, matrix, concat })

  /**
   * Calculate the nth root of a value.
   * The principal nth root of a positive real number A, is the positive real
   * solution of the equation
   *
   *     x^root = A
   *
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *     math.nthRoot(a)
   *     math.nthRoot(a, root)
   *
   * Examples:
   *
   *     math.nthRoot(9, 2)    // returns 3 (since 3^2 == 9)
   *     math.sqrt(9)          // returns 3 (since 3^2 == 9)
   *     math.nthRoot(64, 3)   // returns 4 (since 4^3 == 64)
   *
   * See also:
   *
   *     sqrt, pow
   *
   * @param {number | BigNumber | Fraction | Array | Matrix | Complex} a
   *              Value for which to calculate the nth root
   * @param {number | BigNumber | Fraction} [root=2]    The root.
   * @return {number | BigNumber | Fraction | Complex | Array | Matrix} Returns the nth root of `a`
   */
  function complexErr () {
    throw new Error(
      'Complex number not supported in function nthRoot. Use nthRoots instead.')
  }

  return typed(
    name,
    {
      number: nthRootNumber,
      'number, number': nthRootNumber,

      BigNumber: x => _bigNthRoot(x, new BigNumber(2)),
      'BigNumber, BigNumber': _bigNthRoot,

      Fraction: x => _nthRootFraction(x, new Fraction(2)),
      'Fraction, Fraction': _nthRootFraction,

      Complex: complexErr,
      'Complex, number': complexErr,

      Array: typed.referTo('DenseMatrix,number', selfDn =>
        x => selfDn(matrix(x), 2).valueOf()),
      DenseMatrix: typed.referTo('DenseMatrix,number', selfDn =>
        x => selfDn(x, 2)),
      SparseMatrix: typed.referTo('SparseMatrix,number', selfSn =>
        x => selfSn(x, 2)),

      'SparseMatrix, SparseMatrix': typed.referToSelf(self => (x, y) => {
        // density must be one (no zeros in matrix)
        if (y.density() === 1) {
          // sparse + sparse
          return matAlgo06xS0S0(x, y, self)
        } else {
          // throw exception
          throw new Error('Root must be non-zero')
        }
      }),

      'DenseMatrix, SparseMatrix': typed.referToSelf(self => (x, y) => {
        // density must be one (no zeros in matrix)
        if (y.density() === 1) {
          // dense + sparse
          return matAlgo01xDSid(x, y, self, false)
        } else {
          // throw exception
          throw new Error('Root must be non-zero')
        }
      }),

      'Array, SparseMatrix': typed.referTo('DenseMatrix,SparseMatrix', selfDS =>
        (x, y) => selfDS(matrix(x), y)),

      'number | BigNumber | Fraction, SparseMatrix': typed.referToSelf(self => (x, y) => {
        // density must be one (no zeros in matrix)
        if (y.density() === 1) {
          // sparse - scalar
          return matAlgo11xS0s(y, x, self, true)
        } else {
          // throw exception
          throw new Error('Root must be non-zero')
        }
      })
    },
    matrixAlgorithmSuite({
      scalar: 'number | BigNumber | Fraction',
      SD: matAlgo02xDS0,
      Ss: matAlgo11xS0s,
      sS: false
    })
  )

  /**
   * Calculate the nth root of a for BigNumbers, solve x^root == a
   * https://rosettacode.org/wiki/Nth_root#JavaScript
   * @param {BigNumber} a
   * @param {BigNumber} root
   * @private
   */
  function _bigNthRoot (a, root) {
    const precision = BigNumber.precision
    const Big = BigNumber.clone({ precision: precision + 2 })
    const zero = new BigNumber(0)

    const one = new Big(1)
    const inv = root.isNegative()
    if (inv) {
      root = root.neg()
    }

    if (root.isZero()) {
      throw new Error('Root must be non-zero')
    }
    if (a.isNegative() && !root.abs().mod(2).equals(1)) {
      throw new Error('Root must be odd when a is negative.')
    }

    // edge cases zero and infinity
    if (a.isZero()) {
      return inv ? new Big(Infinity) : 0
    }
    if (!a.isFinite()) {
      return inv ? zero : a
    }

    let x = a.abs().pow(one.div(root))
    // If a < 0, we require that root is an odd integer,
    // so (-1) ^ (1/root) = -1
    x = a.isNeg() ? x.neg() : x
    return new BigNumber((inv ? one.div(x) : x).toPrecision(precision))
  }

  /**
   * Calculate the nth root of a for Fractions, solve x^root == a
   * Returns an exact Fraction when the result is rational,
   * and falls back to the number implementation otherwise,
   * following the same convention as pow for fractions.
   * @param {Fraction} a
   * @param {Fraction} root
   * @returns {Fraction | number} Returns the nth root of a
   * @private
   */
  function _nthRootFraction (a, root) {
    if (root.n === 0n) {
      throw new Error('Root must be non-zero')
    }

    if (a.s < 0) {
      // like the number implementation, the root of a negative value
      // must be an odd integer
      if (root.d !== 1n || root.n % 2n !== 1n) {
        throw new Error('Root must be odd when a is negative.')
      }

      const result = a.neg().pow(root.inverse())
      if (result != null) {
        return result.neg()
      }
    } else {
      const result = a.pow(root.inverse())
      if (result != null) {
        return result
      }
    }

    if (config.predictable) {
      throw new Error('Result of nthRoot is non-rational and cannot be expressed as a fraction')
    } else {
      // downgrade to number, like the fallback of pow for fractions
      return nthRootNumber(a.valueOf(), root.valueOf())
    }
  }
})

export const createNthRootNumber = /* #__PURE__ */ factory(name, ['typed'], ({ typed }) => {
  return typed(name, {
    number: nthRootNumber,
    'number, number': nthRootNumber
  })
})
