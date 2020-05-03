/**
 * https://github.com/toji/gl-matrix
 */
/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
export function create() {
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
export function perspective(fovy, aspect, near, far) {
    const f = 1.0 / Math.tan(fovy / 2);
    const mat4 = create();
    mat4[0] = f / aspect;
    mat4[1] = 0;
    mat4[2] = 0;
    mat4[3] = 0;
    mat4[4] = 0;
    mat4[5] = f;
    mat4[6] = 0;
    mat4[7] = 0;
    mat4[8] = 0;
    mat4[9] = 0;
    mat4[11] = -1;
    mat4[12] = 0;
    mat4[13] = 0;
    mat4[15] = 0;
    if (far != null && far !== Infinity) {
        const nf = 1 / (near - far);
        mat4[10] = (far + near) * nf;
        mat4[14] = 2 * far * near * nf;
    }
    else {
        mat4[10] = -1;
        mat4[14] = -2 * near;
    }
    return mat4;
}
/**
 * Translate a mat4 by the given vector
 *
 * @param {ReadonlyMat4} a the matrix to translate
 * @param {ReadonlyVec3} v vector to translate by
 * @returns {mat4} out
 */
export function translate(a, v) {
    const mat4 = new Float32Array(a);
    const [x, y, z] = v;
    if (a === mat4) {
        mat4[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        mat4[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        mat4[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        mat4[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    }
    else {
        const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23] = a;
        mat4[0] = a00;
        mat4[1] = a01;
        mat4[2] = a02;
        mat4[3] = a03;
        mat4[4] = a10;
        mat4[5] = a11;
        mat4[6] = a12;
        mat4[7] = a13;
        mat4[8] = a20;
        mat4[9] = a21;
        mat4[10] = a22;
        mat4[11] = a23;
        mat4[12] = a00 * x + a10 * y + a20 * z + a[12];
        mat4[13] = a01 * x + a11 * y + a21 * z + a[13];
        mat4[14] = a02 * x + a12 * y + a22 * z + a[14];
        mat4[15] = a03 * x + a13 * y + a23 * z + a[15];
    }
    return mat4;
}
