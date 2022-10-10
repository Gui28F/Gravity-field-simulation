#define PI 3.1415926538
#define rho (5.51* pow(10.,3.))
#define G  (6.67* pow(10.,-11.))
#define RE  (6.371* pow(10.,6.))
precision highp float;
const int MAX_PLANETS=10;


uniform float uRadius[MAX_PLANETS];
uniform vec2 uPosition[MAX_PLANETS];

varying vec2 worldPos;


vec2 force(){
   vec2 force = vec2(0.,0.);
   for(int i = 0; i < MAX_PLANETS; i++){
        if(uRadius[i] != 0.){
            vec2 pos = worldPos;
            vec2 d = normalize(uPosition[i]- pos);
            float m = 4. * PI * pow(uRadius[i]* RE,3.)/3. * rho;
            float f = G * m/pow(length(uPosition[i]- pos)*RE,2.);
            force += f * d;
        }
   }
    return force;
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 color(){
    vec2 f = force();
    float dir = atan(f.y, f.x)/6.3;//[-PI, PI]
    return hsv2rgb(vec3 (dir,1.,1.));
}

float opacity(){
    vec2 f = force();
    float mf = clamp(length(f), 0.0, 1.0);
   // float o = step(mod(cos(length(f))/length(f)  ,1.),.75);
   // float o = step(mod(2.*log(length(f)),1.),.85);
   float o = step(mod(2.303 * log(length(f)),1.),.85);
   //if(length(f) > 110.)
    //   return o;
    return o*mf;
}


void main()
{
    

    gl_FragColor = vec4(color(), opacity());
    
}