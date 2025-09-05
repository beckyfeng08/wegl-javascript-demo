import {mat4, vec4} from 'gl-matrix';
import Drawable from './Drawable';
import Camera from '../../Camera';
import {gl} from '../../globals';
import ShaderProgram from './ShaderProgram';

// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {
  time: number = 0;
  constructor(public canvas: HTMLCanvasElement) {
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    gl.clearColor(r, g, b, a);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  hexToRgb(hex: number): { r: number; g: number; b: number } {
  return {
    r: (hex >> 16) & 0xff,
    g: (hex >> 8) & 0xff,
    b: hex & 0xff
  };
}

  render(camera: Camera, prog: ShaderProgram, drawables: Array<Drawable>, color: number) {
    let color_rgb = this.hexToRgb(color);
    let colorvec4 = vec4.fromValues(color_rgb.r / 255.0,
                                    color_rgb.g / 255.0,
                                    color_rgb.b/ 255.0,
                                    1.0);
    let model = mat4.create();
    let viewProj = mat4.create();
    this.time = this.time + 1;

    mat4.identity(model);
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    prog.setModelMatrix(model);
    prog.setViewProjMatrix(viewProj);
    prog.setGeometryColor(colorvec4);
    prog.setTime(this.time);

    for (let drawable of drawables) {
      prog.draw(drawable);
    }
  }
};

export default OpenGLRenderer;
