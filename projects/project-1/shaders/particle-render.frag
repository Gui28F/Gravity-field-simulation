precision mediump float;

varying float vAgeOut;
varying float vLifeOut;


void main() {
  gl_FragColor = vec4(vec3(1.0, 1.0, 1.0), (vLifeOut - vAgeOut)/vLifeOut);
}