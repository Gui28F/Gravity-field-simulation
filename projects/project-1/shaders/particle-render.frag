precision mediump float;

varying float vAgeOut;
varying float vLifeOut;

void main() {
  gl_FragColor = vec4(0.98, 0.77, 0.65, (vLifeOut - vAgeOut)/vLifeOut);
}