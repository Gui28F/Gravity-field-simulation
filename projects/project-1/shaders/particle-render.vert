precision mediump float;

attribute vec2 vPosition;
attribute float vAge;
attribute float vLife;
attribute vec2 vVelocity;

varying float vAgeOut;
varying float vLifeOut;
void main() {
  vAgeOut = vAge;
  vLifeOut = vLife;
  gl_PointSize = 4.0;
  gl_Position = vec4(vPosition, 0.0, 1.0);
}