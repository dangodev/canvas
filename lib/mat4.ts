/**
 * https://github.com/toji/gl-matrix
 */

type Vec3 = [number, number, number];

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
export function create(): Float32Array {
  // prettier-ignore
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);
}

/**
 * Generates a perspective projection matrix with the given bounds.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */
export function perspective(
  fovy: number,
  aspect: number,
  near: number,
  far: number | null
): Float32Array {
  const f = 1.0 / Math.tan(fovy / 2);
  // prettier-ignore
  const mat4 = new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, 0, -1,
    0, 0, 0, 0,
  ]);
  if (far != null && far !== Infinity) {
    const nf = 1 / (near - far);
    mat4[10] = (far + near) * nf;
    mat4[14] = 2 * far * near * nf;
  } else {
    mat4[10] = -1;
    mat4[14] = -2 * near;
  }
  return mat4;
}

/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @returns {mat4} out
 */
export function rotate(a: Float32Array, rad: number, axis: Vec3) {
  let [x, y, z] = axis;
  const len = 1 / Math.hypot(x, y, z);
  let s, c, t;

  x *= len;
  y *= len;
  z *= len;

  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;

  const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23] = a;

  // Construct the elements of the rotation matrix
  let b00 = x * x * t + c;
  let b01 = y * x * t + z * s;
  let b02 = z * x * t - y * s;
  let b10 = x * y * t - z * s;
  let b11 = y * y * t + c;
  let b12 = z * y * t + x * s;
  let b20 = x * z * t + y * s;
  let b21 = y * z * t - x * s;
  let b22 = z * z * t + c;

  // Perform rotation-specific matrix multiplication
  // prettier-ignore
  return new Float32Array([
    a00*b00+a10*b01+a20*b02, a01*b00+a11*b01+a21*b02, a02*b00+a12*b01+a22*b02, a03*b00+a13*b01+a23*b02,
    a00*b10+a10*b11+a20*b12, a01*b10+a11*b11+a21*b12, a02*b10+a12*b11+a22*b12, a03*b10+a13*b11+a23*b12,
    a00*b20+a10*b21+a20*b22, a01*b20+a11*b21+a21*b22, a02*b20+a12*b21+a22*b22, a03*b20+a13*b21+a23*b22,
    a[12],                   a[13],                   a[14],                   a[15],
  ]);
}

/**
 * Translate a mat4 by the given vector
 *
 * @param {ReadonlyMat4} a the matrix to translate
 * @param {ReadonlyVec3} v vector to translate by
 * @returns {mat4} out
 */
export function translate(a: Float32Array, v: Vec3) {
  const [x, y, z] = v;
  const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23] = a;
  // prettier-ignore
  return new Float32Array([
    a00,                     a01,                     a02,                     a03,
    a10,                     a11,                     a12,                     a13,
    a20,                     a21,                     a22,                     a23,
    a00*x+a10*y+a20*z+a[12], a01*x+a11*y+a21*z+a[13], a02*x+a12*y+a22*z+a[14], a03*x+a13*y+a23*z+a[15],
  ]);
}
