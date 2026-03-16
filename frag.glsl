#version 300 es

precision mediump float;

out vec4 fragColor;

uniform vec2 u_resolution;
uniform vec2 cDim;

uniform vec2 z3Coeff;
uniform vec2 z2Coeff;
uniform vec2 z1Coeff;

#define iters 100
#define escapeThreshold 10000.

vec2 cMul(vec2 v1, vec2 v2) {
  return vec2(v1.x * v2.x - v1.y * v2.y, v1.x * v2.y + v1.y * v2.x);
}

vec2 cSq(vec2 v) {
  return vec2(v.x * v.x - v.y * v.y, 2. * v.x * v.y);
}


int mandelbrot(vec2 c) {
  vec2 z = vec2(0., 0.);
  for (int i = 0; i < iters; i++) {
    vec2 sq = cSq(z);
    z = cMul(z3Coeff, cMul(sq, z)) + cMul(z2Coeff, sq) + cMul(z1Coeff, z) + c;

    if (z.x * z.x + z.y * z.y > escapeThreshold) {
      return i;
    }
  }
  return iters;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution - (0.5, 0.5);
  int m = mandelbrot(uv * cDim);

  fragColor = vec4(vec3(float(m) / float(iters)), 1);
}