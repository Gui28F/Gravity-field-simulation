#define PI 3.1415926538
#define rho (5.51* pow(10.,3.))
#define G  (6.67* pow(10.,-11.))
#define R  (6.371* pow(10.,6.))
precision highp float;
const int MAX_PLANETS=10;

uniform float uRadius[MAX_PLANETS];
uniform vec2 uPosition[MAX_PLANETS];

attribute vec4 vPosition;
attribute vec3 vColor;


varying float fOpacity;
varying vec3 fColor;

float dist(vec2 pos){
    return pow(pow(pos[0]-vPosition[0],2.) + pow(pos[1]-vPosition[1],2.),0.5);
}



float force(){
    float force = 0.;
    for(int i=0;i<MAX_PLANETS;i++){
        float m = 4. * PI* pow(uRadius[i],3.)/3. * rho;
        force += G * m / pow(dist(uPosition[i]),2.);
    }
    return R*force;
}

float opacity(){
   return force();
}

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
    fOpacity =  opacity();;
}

