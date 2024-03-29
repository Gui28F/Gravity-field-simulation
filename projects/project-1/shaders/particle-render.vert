precision mediump float;

attribute vec2 vPosition;
attribute float vAge;
attribute float vLife;
attribute vec2 vVelocity;

varying float vAgeOut;
varying float vLifeOut;

uniform vec2 uScale;
void main() {
  vAgeOut = vAge;
  vLifeOut = vLife;
  gl_PointSize = 1.5;
  gl_Position = vec4(vPosition/uScale, 0.0, 1.0);
 
}