/**
 * WebGL2
 * -> https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Getting_started_with_WebGL
 */
import { create, perspective, translate } from "../lib/mat4.js";
import { degToRad } from "../lib/rad.js";

interface ProgramInfo {
  program: WebGLProgram;
  attribLocations: { vertexPosition: number; vertexColor: number };
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation | null;
    modelViewMatrix: WebGLUniformLocation | null;
  };
}
interface BufferCollection {
  position: WebGLBuffer | null;
  color: WebGLBuffer | null;
}

main();

/** Start here */
function main() {
  const canvas = document.getElementById("gl") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Vertex shader program
  const vsSource = `
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

  // Fragment shader program
  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting for the vertices
  // and so forth is established.
  const shaderProgram = initShaderProgram(
    gl,
    [gl.VERTEX_SHADER, vsSource],
    [gl.FRAGMENT_SHADER, fsSource]
  );

  // Collect all the info needed to use the shader program. Look up which
  // attributes our shader program is using for aVertexPosition, aVertexColor and
  // also look up uniform locations.
  const programInfo: ProgramInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
    },
  };

  // Here's where we call the routine that builds all the objects we'll be
  // drawing.
  const buffers = initBuffers(gl);

  // Draw the scene
  drawScene(gl, programInfo, buffers);
}

/**
 * Initialize the buffers we'll need. For this demo, we just have one object — a
 * simple two-dimensional square.
 */
function initBuffers(gl: WebGL2RenderingContext): BufferCollection {
  // Create a buffer for the square's positions.
  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer operations to from
  // here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the square.
  // prettier-ignore
  const positions = [
    1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
    -1.0, -1.0,
  ];

  // Now pass the list of positions into WebGL to build the shape. We do this by
  // creating a Float32Array from the JavaScript array, then use it to fill the
  // current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the vertices
  // prettier-ignore
  const colors = [
    1.0, 1.0, 1.0, 1.0, // white
    1.0, 0.0, 0.0, 1.0, // red
    0.0, 1.0, 0.0, 1.0, // green
    0.0, 0.0, 1.0, 1.0, // blue
  ];

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
  };
}

/** Draw the scene. */
function drawScene(
  gl: WebGL2RenderingContext,
  programInfo: ProgramInfo,
  buffers: BufferCollection
) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is used to simulate the
  // distortion of perspective in a camera. Our field of view is 45 degrees,
  // with a width/height ratio that matches the display size of the canvas and
  // we only want to see objects between 0.1 units and 100 units away from the
  // camera.
  const canvas = gl.canvas as HTMLCanvasElement;
  const fieldOfView = degToRad(45); // in radians
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = perspective(fieldOfView, aspect, zNear, zFar);

  // Set the drawing position to the "identity" point, which is the center of
  // the scene, and move the drawing position a bit to where we want to start
  // drawing the square.
  const modelViewMatrix = translate(create(), [-0.0, 0.0, -6.0]); // amount to translate

  // Tell WebGL how to pull out the positions from the position buffer into the
  // vertexPosition attribute.
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    2, // pull out 2 values per iteration
    gl.FLOAT, // the data in the buffer is 32bit floats
    false, // don't normalize
    0, // how many bytes to get from one set of values to the next
    0 // how many bytes inside the buffer to start from
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    4,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  console.log("drew");
}

/** Initialize a shader program, so WebGL knows how to draw our data */
function initShaderProgram(
  gl: WebGL2RenderingContext,
  ...shaders: [number, string][]
): WebGLProgram {
  const shaderProgram = gl.createProgram() as WebGLProgram;
  shaders.forEach(([type, source]) => {
    gl.attachShader(shaderProgram, loadShader(gl, type, source));
  });
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error(
      `error initializing shaders: ${gl.getProgramInfoLog(shaderProgram)}`
    );
  }

  return shaderProgram;
}

/** creates a shader of the given type, uploads the source and compiles it. */
function loadShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type) as WebGLShader;

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`error compiling shaders: ${gl.getShaderInfoLog(shader)}`);
  }

  return shader;
}
