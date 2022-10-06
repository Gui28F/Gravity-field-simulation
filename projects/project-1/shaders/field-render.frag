#define PI 3.1415926538
#define rho (5.51* pow(10.,3.))
#define G  (6.67* pow(10.,-11.))
#define RE  (6.371* pow(10.,6.))
precision highp float;
const int MAX_PLANETS=10;


uniform float uRadius[MAX_PLANETS];
uniform vec2 uPosition[MAX_PLANETS];

varying vec2 worldPos;
varying vec2 sca;

vec2 force(){
   vec2 force = vec2(0.,0.);
   for(int i = 0; i < MAX_PLANETS; i++){
        if(uRadius[i] != 0.){
            vec2 pos = worldPos;
            vec2 d = normalize(uPosition[i]*sca- pos);
            float m = 4. * PI * pow(uRadius[i] * RE,3.)/3. * rho;
            float f = G * m/pow(length(uPosition[i]*sca- pos)*RE,2.);
            force += f * d;
        }
   }
    return force;
}

vec3 color(){
    vec2 f = force();
    float dir = atan(f.x, f.y) + 2. * PI;//[-PI, PI]
    float r = sin(dir)* 120. / 255. + 135. / 255.;
    float g = sin(dir + 2. * PI/3.) * 120. / 255. + 90. / 255.;
    float b = sin(dir + 4. * PI/3.)* 120. / 255. + 90. / 255.;
    return vec3 (r,g,b);
}

float opacity(){
    vec2 f = force();
    float mf = clamp(length(f), 0.0, 1.0);
    return mf;
}

void main()
{
    float l = clamp(length(force()), 0.0, 1.0);
    if(mod(l, l*l)< l*l)
        l +=  0.;
    else l += 1.;

    gl_FragColor = vec4(color() , opacity());
    
}