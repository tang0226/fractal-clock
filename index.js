const canvas = document.getElementById("main-canvas");
const gl = canvas.getContext("webgl2");

var width = 1000;
var height = 1000;

function setCanvasDim(w, h) {
    canvas.width = w;
    canvas.height = h;
    width = w;
    height = h;
}

setCanvasDim(window.innerWidth, window.innerHeight);


async function loadShaderText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load shader from ${url}: ${response.statusText}`);
  }
  return await response.text();
}

async function loadShaderFiles(callback) {
  var vertexShaderSource, fragmentShaderSource;
  try {
    const vertexShaderSource = await loadShaderText('./vert.glsl');
    const fragmentShaderSource = await loadShaderText('./frag.glsl');
    callback(vertexShaderSource, fragmentShaderSource);
  } catch (error) {
    console.error('Error loading shaders:', error);
    return false;
  }
}


function createShader(gl, type, source) {
  // Create the shader
  var shader = gl.createShader(type);
  // Set the shader's source
  gl.shaderSource(shader, source);
  // Compile the shader
  gl.compileShader(shader);

  // Check the compile status of our shader
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  // Failure; print the shader's info log
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  // create the program
  var program = gl.createProgram();
  // attach the shader objects to the program
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  // Link the two shaders
  gl.linkProgram(program);

  // Check the link status of the program
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  // Failure; print the program's info log
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}



loadShaderFiles(main);

function main(vertexShaderSource, fragmentShaderSource) {

var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
var program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

var positionAttributeLocation = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(positionAttributeLocation);

var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
var positions = [
  -1, 1,
  1, 1,
  1, -1,
  1, -1,
  -1, -1,
  -1, 1
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

// clip space viewport
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);




// Uniforms
var resLoc = gl.getUniformLocation(program, "u_resolution");
var z1CoeffLoc = gl.getUniformLocation(program, "z1Coeff");
var z2CoeffLoc = gl.getUniformLocation(program, "z2Coeff");
var z3CoeffLoc = gl.getUniformLocation(program, "z3Coeff");
var cDimLoc = gl.getUniformLocation(program, "cDim");

var hourHand = 0.5;
var minuteHand = 0.75;
var secondHand = 1;
var zoom = 4;

function draw() {
  // Update the resolution uniform
  gl.uniform2f(resLoc, width, height);

  // Get the times
  let date = new Date();
  let s = date.getSeconds() + date.getMilliseconds() / 1000;
  let m = date.getMinutes() + s / 60;
  let h = date.getHours() + m / 60;
  
  let sTheta = s / 60 * 2 * Math.PI;
  let mTheta = m / 60 * 2 * Math.PI;
  // 12-hour mode
  let hTheta = (h % 12) / 24 * 2 * Math.PI;

  let sc = [Math.sin(sTheta) * secondHand, Math.cos(sTheta) * secondHand];
  let mc = [Math.sin(mTheta) * minuteHand, Math.cos(mTheta) * minuteHand];
  let hc = [Math.sin(hTheta) * hourHand, Math.cos(hTheta) * hourHand];

  gl.uniform2f(z1CoeffLoc, ...sc);
  gl.uniform2f(z2CoeffLoc, ...mc);
  gl.uniform2f(z3CoeffLoc, ...hc);

  // Adjust the complex plane dimensions based on the canvas dimensions
  let reW, imH;
  if (width < height) {
    reW = zoom;
    imH = reW * height / width;
  }
  else {
    imH = zoom;
    reW = imH * width / height;
  }

  gl.uniform2f(cDimLoc, reW, imH);
  
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  window.requestAnimationFrame(draw);
}

draw();



}

