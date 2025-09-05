import {vec3, vec4} from 'gl-matrix';
const Stats = require('stats-js');
import * as DAT from 'dat.gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  color: 0xFFE317,
  currobject: "Cube",
  'Load Scene': loadScene, // A function pointer, essentially
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let prevTesselations: number = 5;
let prevColor: number = 0xFFE317;
let shapeList = ["Cube", "Square", "Icosphere"];

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
}



function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'currobject', shapeList)
     .name('Object')
     .onChange((currobject) => {
       console.log('Selected object:', currobject);
     });
  
  gui.add(controls, 'Load Scene');
  gui.addColor(controls, 'color');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));
  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    if(controls.tesselations != prevTesselations && controls.currobject == "Icosphere")
    {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
      icosphere.create();
    }
    if (controls.color != prevColor  && controls.currobject == "Cube")
    {
      prevColor = controls.color;
      cube = new Cube(vec3.fromValues(0, 0, 0));
      cube.create();
    } else if (controls.color != prevColor  && controls.currobject == "Square")
    {
      prevColor = controls.color;
      square = new Square(vec3.fromValues(0, 0, 0));
      square.create();
    } else if (controls.color != prevColor  && controls.currobject == "Icosphere")
    {
      prevColor = controls.color;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }
  
    if (controls.currobject == "Cube")
    renderer.render(camera, lambert, [
      // icosphere,
      // square,
      cube,
    ], controls.color);
    if (controls.currobject == "Square")
    renderer.render(camera, lambert, [
      // icosphere,
      square,
      // cube,
    ], controls.color);
    if (controls.currobject == "Icosphere")
    renderer.render(camera, lambert, [
      icosphere,
      // square,
      // cube,
    ], controls.color);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
