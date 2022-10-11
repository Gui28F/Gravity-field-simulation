precision mediump float;

varying float vAgeOut;
varying float vLifeOut;

void main() {
  gl_FragColor = vec4(0.9, 0.9, 0.8, (vLifeOut - vAgeOut)/vLifeOut);
}