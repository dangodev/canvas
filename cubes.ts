/**
 * Cubes
 * Adapted heavily from this wonderful blog post: https://www.basedesign.com/blog/how-to-render-3d-in-2d-canvas
 */

// setup
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = canvas.clientWidth * devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;
ctx.scale(devicePixelRatio, devicePixelRatio);

// Settings
type Coord2D = [number, number]; // x,y
type Coord3D = [number, number, number]; // x,y,z
let FIELD_OF_VIEW = canvas.clientWidth * 0.8;

// Geometry
class Cube {
  x: number;
  y: number;
  z: number;
  lines: Coord2D[] = [
    [0, 1],
    [1, 3],
    [3, 2],
    [2, 0],
    [2, 6],
    [3, 7],
    [0, 4],
    [1, 5],
    [6, 7],
    [6, 4],
    [7, 5],
    [4, 5],
  ];
  vertices: Coord3D[] = [
    [-1, -1, -1],
    [1, -1, -1],
    [-1, 1, -1],
    [1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [-1, 1, 1],
    [1, 1, 1],
  ];
  radius: number;

  constructor() {
    this.x = (Math.random() - 0.5) * canvas.clientWidth;
    this.y = (Math.random() - 0.5) * canvas.clientWidth;
    this.z = (Math.random() - 0.5) * canvas.clientWidth;
    this.radius = Math.floor(Math.random() * 12 + 10);
  }

  project(x: number, y: number, z: number) {
    const sizeProjection = FIELD_OF_VIEW / (FIELD_OF_VIEW + z);
    const xProject = x * sizeProjection + canvas.clientWidth / 2;
    const yProject = y * sizeProjection + canvas.clientHeight / 2;
    return {
      size: sizeProjection,
      x: xProject,
      y: yProject,
    };
  }

  draw() {
    if (this.z < -FIELD_OF_VIEW + this.radius) {
      return;
    }
    this.lines.forEach(([lineX, lineY]) => {
      const v1 = {
        x: this.x + this.radius * this.vertices[lineX][0],
        y: this.y + this.radius * this.vertices[lineX][1],
        z: this.z + this.radius * this.vertices[lineX][2],
      };
      const v2 = {
        x: this.x + this.radius * this.vertices[lineY][0],
        y: this.y + this.radius * this.vertices[lineY][1],
        z: this.z + this.radius * this.vertices[lineY][2],
      };
      const v1Project = this.project(v1.x, v1.y, v1.z);
      const v2Project = this.project(v2.x, v2.y, v2.z);
      ctx.beginPath();
      ctx.moveTo(v1Project.x, v1Project.y);
      ctx.lineTo(v2Project.x, v2Project.y);
      ctx.stroke();
    });
  }
}

const shapes = Array.from(new Array(100)).map(() => new Cube());

function render() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  for (var i = 0; i < shapes.length; i++) {
    shapes[i].draw();
  }

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
