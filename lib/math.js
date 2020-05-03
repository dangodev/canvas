export function degToRad(deg) {
    return (deg * Math.PI) / 180;
}
export function radToDeg(rad) {
    return (rad * 180) / Math.PI;
}
export function isPowerOf2(n) {
    return (n & (n - 1)) == 0;
}
