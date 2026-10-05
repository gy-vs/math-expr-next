// test nthRoot
import assert from 'assert'

import { approxEqual, approxDeepEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.js'
const mathPredictable = math.create({ predictable: true })
const matrix = math.matrix
const sparse = math.sparse
const unit = math.unit
const nthRoot = math.nthRoot
const big = math.bignumber
const complex = math.complex
const fraction = math.fraction

describe('nthRoot', function () {
  it('should return the nthRoot of a boolean value', function () {
    assert.strictEqual(nthRoot(true), 1)
    assert.strictEqual(nthRoot(false), 0)
    assert.strictEqual(nthRoot(1, true), 1)
  })

  it('should return the nthRoot for numbers', function () {
    approxEqual(nthRoot(4), 2)
    approxEqual(nthRoot(9), 3)
    approxEqual(nthRoot(8, 3), 2)
    approxEqual(nthRoot(64, 3), 4)
    approxEqual(nthRoot(2, 2.5), 1.31950791077289)
    approxEqual(nthRoot(2.5, 2), 1.58113883008419)
    approxEqual(nthRoot(0.1 + 0.2), 0.5477225575051662) // a value containing a round-off error
    approxEqual(nthRoot(0, 3), 0)
    approxEqual(nthRoot(0, 2), 0)
    approxEqual(nthRoot(0.0001, 3), 0.0464158883361278)
  })

  it('should return the nthRoot for very large numbers', function () {
    approxEqual(nthRoot(2e150 * 2e150), 2e150)
    approxEqual(nthRoot(Math.pow(2, 1000)), 3.273390607896142e+150)
  })

  it('should return the nthRoot for small large numbers', function () {
    approxEqual(nthRoot(4e-300), 2e-150)
  })

  it('should return the nthRoot for negative numbers', function () {
    approxEqual(nthRoot(-64, 3), -4)
    approxEqual(nthRoot(-8, 3), -2)
    // Newton's method fails in this particular case: --ericman314
    approxEqual(nthRoot(-2, 3), -1.2599210498949)
  })

  it('should return the nthRoot for negative roots', function () {
    approxEqual(nthRoot(64, -3), 0.25)
    approxEqual(nthRoot(-64, -3), -0.25)
  })

  it('should return the nthRoot for zero', function () {
    assert.strictEqual(nthRoot(0, 2), 0)
    assert.strictEqual(nthRoot(0, -2), Infinity)
  })

  it('should return the nthRoot for infinity', function () {
    approxEqual(nthRoot(Infinity, 2), Infinity)
    approxEqual(nthRoot(-Infinity, 3), -Infinity)
    approxEqual(nthRoot(Infinity, -3), 0)
  })

  it('should throw an error when n is zero', function () {
    assert.throws(function () { nthRoot(4, 0) }, /Root must be non-zero/)
  })

  it('should throw an error when value is negative and root is even', function () {
    assert.throws(function () { nthRoot(-27, 2) }, /Root must be odd when a is negative/)
    assert.throws(function () { nthRoot(-27, 2.5) }, /Root must be odd when a is negative/)
  })

  it('should throw an error if invalid number of arguments', function () {
    assert.throws(function () { nthRoot() }, /TypeError: Too few arguments/)
    assert.throws(function () { nthRoot(1, 2, 3) }, /TypeError: Too many arguments/)
  })

  it('should throw an in case of wrong type of arguments', function () {
    assert.throws(function () { nthRoot(null) }, /TypeError: Unexpected type of argument/)
  })

  it('should return the nthRoot of bignumbers', function () {
    assert.deepStrictEqual(nthRoot(big(4)), big(2))
    assert.deepStrictEqual(nthRoot(big(9)), big(3))
    assert.deepStrictEqual(nthRoot(big(8), big(3)), big(2))
    assert.deepStrictEqual(nthRoot(big(64), big(3)), big(4))
  })

  it('should return the nthRoot of negative bignumber values', function () {
    assert.deepStrictEqual(nthRoot(big(-2), big(3)), big('-1.259921049894873164767210607278228350570251464701507980081975112'))
    assert.deepStrictEqual(nthRoot(big(-64), big(3)), big(-4))
  })

  it('should return the nthRoot of negative bignumber roots', function () {
    assert.deepStrictEqual(nthRoot(big(64), big(-3)), big(0.25))
    assert.deepStrictEqual(nthRoot(big(-64), big(3)), big(-4))
    assert.deepStrictEqual(nthRoot(big(-64), big(-3)), big(-0.25))
  })

  it('should return the nthRoot for bignumber zero', function () {
    assert.deepStrictEqual(nthRoot(big(0), big(2)).toString(), '0')
    assert.deepStrictEqual(nthRoot(big(0), big(-2)).toString(), 'Infinity')
  })

  it('should return the nthRoot for bignumber infinity', function () {
    assert.deepStrictEqual(nthRoot(big(Infinity), big(2)).toString(), 'Infinity')
    assert.deepStrictEqual(nthRoot(big(-Infinity), big(3)).toString(), '-Infinity')
    assert.deepStrictEqual(nthRoot(big(Infinity), big(-3)), big(0))
  })

  it('should return the nthRoot for fractions', function () {
    assert.deepStrictEqual(nthRoot(fraction(4, 9)), fraction(2, 3))
    assert.deepStrictEqual(nthRoot(fraction(1, 4), 2), fraction(1, 2))
    assert.deepStrictEqual(nthRoot(fraction(8, 27), 3), fraction(2, 3))
    assert.deepStrictEqual(nthRoot(fraction(16, 81), 4), fraction(2, 3))
    assert.deepStrictEqual(nthRoot(fraction(16, 81), fraction(4)), fraction(2, 3))
  })

  it('should return the nthRoot for negative fractions', function () {
    assert.deepStrictEqual(nthRoot(fraction(-8, 27), 3), fraction(-2, 3))
    assert.deepStrictEqual(nthRoot(fraction(-8, 27), fraction(3)), fraction(-2, 3))
  })

  it('should return the nthRoot for negative fraction roots', function () {
    assert.deepStrictEqual(nthRoot(fraction(64), -3), fraction(1, 4))
    assert.deepStrictEqual(nthRoot(fraction(1, 4), fraction(-2)), fraction(2))
    assert.deepStrictEqual(nthRoot(fraction(-8, 27), -3), fraction(-3, 2))
  })

  it('should return the nthRoot for fraction zero', function () {
    assert.deepStrictEqual(nthRoot(fraction(0), 2), fraction(0))
    assert.strictEqual(nthRoot(fraction(0), -2), Infinity)
  })

  it('should return a number for a non-rational nthRoot of a fraction', function () {
    approxEqual(nthRoot(fraction(2)), 1.4142135623730951)
    approxEqual(nthRoot(fraction(2), 3), 1.2599210498948732)
    approxEqual(nthRoot(fraction(-2), 3), -1.2599210498948732)
    approxEqual(nthRoot(fraction(2), 2.5), 1.3195079107728942)
  })

  it('should throw an error for a non-rational nthRoot of a fraction when predictable:true', function () {
    assert.throws(function () { mathPredictable.nthRoot(fraction(2), 2) }, /Result of nthRoot is non-rational and cannot be expressed as a fraction/)
  })

  it('should throw an error when a fraction is negative and the root is even or non-integer', function () {
    assert.throws(function () { nthRoot(fraction(-27, 8), 2) }, /Root must be odd when a is negative/)
    assert.throws(function () { nthRoot(fraction(-27, 8), fraction(5, 2)) }, /Root must be odd when a is negative/)
  })

  it('should throw an error when the root of a fraction is zero', function () {
    assert.throws(function () { nthRoot(fraction(4), 0) }, /Root must be non-zero/)
    assert.throws(function () { nthRoot(fraction(4), fraction(0)) }, /Root must be non-zero/)
  })

  it('should return the nthRoot of a fraction in a fraction-configured instance', function () {
    const mathFraction = math.create({ number: 'Fraction' })
    assert.deepStrictEqual(mathFraction.evaluate('nthRoot(16/81, 4)'), fraction(2, 3))
    assert.deepStrictEqual(mathFraction.evaluate('nthRoot(-8/27, 3)'), fraction(-2, 3))
  })

  it('should throw an error when used with a complex number', function () {
    assert.throws(function () { nthRoot(complex('-8'), 3) })
  })

  it('should throw an error when used with a complex number and root is less than 0', function () {
    assert.throws(function () { nthRoot(complex('-1'), -1) })
  })

  it('should throw an error when used with a complex number and root is not an integer', function () {
    assert.throws(function () { nthRoot(complex('-1 + 2i'), 0.5) })
  })

  it('should throw an error when used on a unit', function () {
    assert.throws(function () { nthRoot(unit('5cm')) })
  })

  it('should throw an error when used on a string', function () {
    assert.throws(function () { nthRoot('text') })
  })

  describe('Array', function () {
    it('should return the nthRoot for array - scalar', function () {
      approxDeepEqual(nthRoot([8, 27, 64], 3), [2, 3, 4])
      approxDeepEqual(nthRoot(64, [2, 3, 8]), [8, 4, 1.68179283050743])
    })

    it('should return the nthRoot for array - array', function () {
      approxDeepEqual(nthRoot([[64, 3125], [0, -1]], [[3, 5], [1, 3]]), [[4, 5], [0, -1]])
    })

    it('should return the nthRoot for broadcastable arrays', function () {
      approxDeepEqual(nthRoot([64, 3125], [[3], [1]]), [[3.9999999999999996, 14.620088691064328], [64, 3125]])
      approxDeepEqual(nthRoot([[64], [0]], [3, 5]), [[3.9999999999999996, 2.29739670999407], [0, 0]])
    })

    it('should return the nthRoot for array - dense matrix', function () {
      approxDeepEqual(nthRoot([[64, 3125], [0, -1]], matrix([[3, 5], [1, 3]])), matrix([[4, 5], [0, -1]]))
    })

    it('should return the nthRoot for array - sparse matrix', function () {
      approxDeepEqual(nthRoot([[64, 3125], [0, -1]], sparse([[3, 5], [1, 3]])), matrix([[4, 5], [0, -1]]))
    })
  })

  describe('DenseMatrix', function () {
    it('should return the nthRoot for dense matrix - scalar', function () {
      approxDeepEqual(nthRoot(matrix([8, 27, 64]), 3), matrix([2, 3, 4]))
      approxDeepEqual(nthRoot(64, matrix([2, 3, 8])), matrix([8, 4, 1.68179283050743]))
    })

    it('should return the nthRoot for dense matrix - array', function () {
      approxDeepEqual(nthRoot(matrix([[64, 3125], [0, -1]]), [[3, 5], [1, 3]]), matrix([[4, 5], [0, -1]]))
    })

    it('should return the nthRoot for dense matrix - dense matrix', function () {
      approxDeepEqual(nthRoot(matrix([[64, 3125], [0, -1]]), matrix([[3, 5], [1, 3]])), matrix([[4, 5], [0, -1]]))
    })

    it('should return the nthRoot for dense matrix - sparse matrix', function () {
      approxDeepEqual(nthRoot(matrix([[64, 3125], [0, -1]]), sparse([[3, 5], [1, 3]])), matrix([[4, 5], [0, -1]]))
    })
  })

  describe('SparseMatrix', function () {
    it('should return the nthRoot for sparse matrix - scalar', function () {
      approxDeepEqual(nthRoot(sparse([[8, 27], [0, 64]]), 3), sparse([[2, 3], [0, 4]]))
      approxDeepEqual(nthRoot(64, sparse([[2, 3], [1, 8]])), sparse([[8, 4], [64, 1.68179283050743]]))
    })

    it('should return the nthRoot for sparse matrix - array', function () {
      approxDeepEqual(nthRoot(sparse([[64, 3125], [0, -1]]), [[3, 5], [1, 3]]), sparse([[4, 5], [0, -1]]))
    })

    it('should return the nthRoot for sparse matrix - dense matrix', function () {
      approxDeepEqual(nthRoot(sparse([[64, 3125], [0, -1]]), matrix([[3, 5], [1, 3]])), sparse([[4, 5], [0, -1]]))
    })

    it('should return the nthRoot for sparse matrix - sparse matrix', function () {
      approxDeepEqual(nthRoot(sparse([[64, 3125], [0, -1]]), sparse([[3, 5], [1, 3]])), sparse([[4, 5], [0, -1]]))
    })
  })

  describe('Fraction', function () {
    it('should return the nthRoot for array - scalar with fractions', function () {
      assert.deepStrictEqual(nthRoot([fraction(1, 4), fraction(9, 16)], 2), [fraction(1, 2), fraction(3, 4)])
      assert.deepStrictEqual(nthRoot([fraction(1, 4), fraction(9, 16)], fraction(2)), [fraction(1, 2), fraction(3, 4)])
      assert.deepStrictEqual(nthRoot(fraction(1, 16), [2, 4]), [fraction(1, 4), fraction(1, 2)])
    })

    it('should return the nthRoot for array - array with fractions', function () {
      assert.deepStrictEqual(nthRoot([[fraction(1, 4), fraction(8, 27)]], [[2, 3]]), [[fraction(1, 2), fraction(2, 3)]])
    })

    it('should return the nthRoot for dense matrix - scalar with fractions', function () {
      assert.deepStrictEqual(nthRoot(matrix([fraction(1, 4), fraction(9, 16)]), 2), matrix([fraction(1, 2), fraction(3, 4)]))
      assert.deepStrictEqual(nthRoot(matrix([fraction(1, 4), fraction(9, 16)]), fraction(2)), matrix([fraction(1, 2), fraction(3, 4)]))
    })

    it('should return the nthRoot for dense matrix - dense matrix with fractions', function () {
      assert.deepStrictEqual(nthRoot(matrix([[fraction(1, 4), fraction(8, 27)]]), matrix([[2, 3]])), matrix([[fraction(1, 2), fraction(2, 3)]]))
    })

    it('should return the nthRoot for sparse matrix - scalar with fractions', function () {
      assert.deepStrictEqual(nthRoot(sparse([fraction(1, 4), fraction(9, 16)]), 2), sparse([fraction(1, 2), fraction(3, 4)]))
    })

    it('should return the nthRoot for sparse matrix - sparse matrix with fractions', function () {
      assert.deepStrictEqual(nthRoot(sparse([[fraction(1, 4), fraction(8, 27)]]), sparse([[2, 3]])), sparse([[fraction(1, 2), fraction(2, 3)]]))
    })
  })

  it('should LaTeX nthRoot', function () {
    const expression = math.parse('nthRoot(8,3)')
    assert.strictEqual(expression.toTex(), '\\sqrt[3]{8}')
  })
})
