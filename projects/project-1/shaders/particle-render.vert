precision mediump float;

attribute vec2 vPosition;
attribute float vAge;
attribute float vLife;
attribute vec2 vVelocity;

varying float vAgeOut;
varying float vLifeOut;

uniform vec2 scale;

void main() {
  vAgeOut = vAge;
  vLifeOut = vLife;
  gl_PointSize = 2.5;
  gl_Position = vec4(vPosition/scale, 0.0, 1.0);//multiplicar pela escala
}