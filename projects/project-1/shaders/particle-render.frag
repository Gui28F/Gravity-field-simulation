precision mediump float;

varying float vAgeOut;
varying float vLifeOut;

void main() {
  gl_FragColor = vec4(1., 0.9, 0.7, (vLifeOut - vAgeOut)/vLifeOut);
}