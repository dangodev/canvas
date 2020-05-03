/**
 * WebGL2
 * -> https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL
 */
import { create, perspective, rotate, translate } from "../lib/mat4.js";
import { degToRad, isPowerOf2 } from "../lib/math.js";
let cubeRotation = 0.0;
main();
function main() {
    const canvas = document.getElementById("gl");
    const gl = canvas.getContext("webgl2");
    const vertShader = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;
    const fragShader = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;
    const shaderProgram = initShaderProgram(gl, vertShader, fragShader); // prettier-ignore
    // prettier-ignore
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
        },
    };
    const buffers = initBuffers(gl);
    const texture = loadTexture(gl, "cubetexture.png");
    var then = 0;
    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001; // convert to seconds
        const deltaTime = now - then;
        then = now;
        drawScene(gl, programInfo, buffers, texture, deltaTime);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
function initBuffers(gl) {
    // prettier-ignore
    const positions = [
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
    ];
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    // prettier-ignore
    const textureCoordinates = [
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    ];
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW); // prettier-ignore
    // prettier-ignore
    const indices = [
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23,
    ];
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW); // prettier-ignore
    return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
    };
}
/** Initialize a texture and load an image. When the image finished loading copy it into the texture. */
function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Because images have to be download over the internet they might take a
    // moment until they are ready. Until then put a single pixel in the texture
    // so we can use it immediately. When the image has finished downloading we'll
    // update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel); // prettier-ignore
    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image); // prettier-ignore
        // WebGL1 has different requirements for power of 2 images vs non power of 2
        // images so check if the image is a power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        else {
            // No, it's not a power of 2. Turn of mips and set wrapping to clamp to
            // edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;
    return texture;
}
/** Draw the scene. */
function drawScene(gl, programInfo, buffers, texture, deltaTime) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the canvas before we start drawing on it.
    // perspective matrix
    const canvas = gl.canvas;
    const fieldOfView = degToRad(45); // in radians
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    // position
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0); // prettier-ignore
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    // texture
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, 4, gl.FLOAT, false, 0, 0); // prettier-ignore
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
    // indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    gl.useProgram(programInfo.program);
    const projectionMatrix = perspective(fieldOfView, aspect, zNear, zFar);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix); // prettier-ignore
    let modelViewMatrix = create();
    modelViewMatrix = translate(modelViewMatrix, [-0.0, 0.0, -6.0]); // amount to translate
    modelViewMatrix = rotate(modelViewMatrix, cubeRotation, [0, 0, 1]); // rotate Z
    modelViewMatrix = rotate(modelViewMatrix, cubeRotation * 0.7, [0, 1, 0]); // rotate Y
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix); // prettier-ignore
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    cubeRotation += deltaTime;
}
/** Initialize a shader program, so WebGL knows how to draw our data */
function initShaderProgram(gl, vertShader, fragShader) {
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, loadShader(gl, gl.VERTEX_SHADER, vertShader));
    gl.attachShader(shaderProgram, loadShader(gl, gl.FRAGMENT_SHADER, fragShader)); // prettier-ignore
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error(`error initializing shaders: ${gl.getProgramInfoLog(shaderProgram)}`);
    }
    return shaderProgram;
}
/** creates a shader of the given type, uploads the source and compiles it. */
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(`error compiling shaders: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
}
