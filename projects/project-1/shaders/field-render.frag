#define PI 3.1415926538
#define rho (5.51* pow(10.,3.))
#define G  (6.67* pow(10.,-11.))
#define R  (6.371* pow(10.,6.))
precision highp float;
const int MAX_PLANETS=10;

uniform float uRadius[MAX_PLANETS];
uniform vec2 uPosition[MAX_PLANETS];

varying vec4 fPosition;
varying vec3 fColor;


vec2 force(){
   vec2 force = vec2(0.,0.);
   for(int i = 0; i < MAX_PLANETS; i++){
        vec2 pos = fPosition.xy;
        vec2 r = normalize(uPosition[i] - pos);

   }
    return R*force;
}

float opacity(){
   return force()[0];
}

void main()
{
    gl_FragColor = vec4(fColor,1.);

}