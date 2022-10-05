precision highp float;
#define PI 3.1415926538
attribute vec4 vPosition;
attribute vec3 vColor;


varying vec4 fPosition;
varying vec3 fColor;



vec3 color(){

    float frequency = 0.0087;
    float r = sin(frequency * 1. + 0.) * 125. / 255. + 128. / 255.;
    float g = sin(frequency * 1. + 2. * PI / 3.) * 125. / 255. + 128. / 255.;
    float b = sin(frequency * 1. + 4. * PI / 3.) * 125. / 255. + 128. / 255.;
    
  return vec3(r,g,b)  ;
}
void main() 
{
    gl_Position = vPosition;
    fColor = color();
    fPosition = vPosition;
}

