precision highp float;
#define PI 3.1415926538

attribute vec2 vPosition;

uniform vec2 scale;
varying vec2 worldPos;


void main() 
{
    worldPos = vPosition * scale;
    gl_Position = vec4(vPosition,0.,1.);
}

