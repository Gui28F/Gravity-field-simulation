#define PI 3.1415926538
#define rho (5.51* pow(10.,3.))
#define G  (6.67* pow(10.,-11.))
#define RE  (6.371* pow(10.,6.))
precision highp float;
const int MAX_PLANETS=10;

uniform float uRadius[MAX_PLANETS];
uniform vec2 uPosition[MAX_PLANETS];

/* Number of seconds (possibly fractional) that has passed since the last
   update step. */
uniform float uDeltaTime;
uniform vec2 uStartPoint;
uniform float uMinAngle;
uniform float uMaxAngle;
uniform float uMinSpeed;
uniform float uMaxSpeed;
uniform float uMinLife;
uniform float uMaxLife;
/* Inputs. These reflect the state of a single particle before the update. */
uniform float uSourceAngle;

attribute vec2 vPosition;              // actual position
attribute float vAge;                  // actual age (in seconds)
attribute float vLife;                 // when it is supposed to dye 
attribute vec2 vVelocity;              // actual speed

/* Outputs. These mirror the inputs. These values will be captured into our transform feedback buffer! */
varying vec2 vPositionOut;
varying float vAgeOut;
varying float vLifeOut;
varying vec2 vVelocityOut;

// generates a pseudo random number that is a function of the argument. The argument needs to be constantly changing from call to call to generate different results
highp float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}


vec2 force(){
   vec2 force = vec2(0.,0.);
  
   for(int i = 0; i < MAX_PLANETS; i++){
      if(uRadius[i] != 0.){
        vec2 pos = vPosition.xy;
        vec2 d = normalize(uPosition[i] - pos);
        float m = 4. * PI * pow(uRadius[i] * RE,3.)/3. * rho;
        float f = G * m/pow(length(uPosition[i] - pos)*RE,2.);
        force += f * d ;
      }
   }
    return force;
}

void main() {

    /* Update parameters according to our simple rules.*/
   
   vPositionOut = vPosition + vVelocity * uDeltaTime;
   vLifeOut = vLife;
   vec2 accel = force();
   vVelocityOut = vVelocity + accel * uDeltaTime;
   if(length(vVelocityOut)>uMaxSpeed)
      vVelocityOut = vVelocity;
   vAgeOut = vAge + uDeltaTime;
   
   if (vAgeOut >= vLife ) {
      // It's all up to you!
      float angle = uMinAngle + rand(vec2(sin(vPosition.x), vLife))*(uMaxAngle - uMinAngle);
      float x = cos(angle-PI/2.-uSourceAngle);
      float y = sin(angle-PI/2.-uSourceAngle);
      if(uStartPoint == vec2(-3,-3))
         vPositionOut = vPosition;
      else
         vPositionOut = uStartPoint;
      vAgeOut = .0;
      vLifeOut = uMinLife + rand(vec2(vPosition.x, vLife))*(uMaxLife - uMinLife);;
      if(uStartPoint != vec2(-3,-3))
         vVelocityOut = vec2(x, y ) * rand(vec2(vPosition.y, uMaxSpeed))*(uMaxSpeed);
   }

}