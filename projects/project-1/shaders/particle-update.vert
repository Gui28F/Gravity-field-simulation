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
uniform float uBeta;
uniform float uMinSpeed;
uniform float uMaxSpeed;
uniform float uMinLife;
uniform float uMaxLife;
uniform float uSourceAngle;

/* Inputs. These reflect the state of a single particle before the update. */
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

// Calculates the force applied by all the planets. 
vec2 force(){
   vec2 force = vec2(0.,0.);
   vec2 pos = vPosition.xy;
   for(int i = 0; i < MAX_PLANETS; i++){
      if(uRadius[i] > 0. ){
         vec2 d = normalize(uPosition[i] - pos);
         float m = 4. * PI * pow(uRadius[i] * RE,3.)/3. * rho;
         float f = G * m/pow(length(uPosition[i]- pos)*RE,2.);
         force += f * d ;
      }
   }
    return force;
}

/* Checks if the argument particle intercepts any planets. Returns true if it intersects or false otherwise */
bool intersectedPlanet(vec2 pos){
   for(int i = 0; i < MAX_PLANETS; i++){
      vec2 uPos = uPosition[i];
      if(pow(pos.x-uPos.x,2.)+pow(pos.y-uPos.y,2.)<pow(uRadius[i],2.))
         return true;
   }
   return false;
}

void main() {
   bool isInsidePlanet = intersectedPlanet(vPosition);
   if(isInsidePlanet && vAge == 0. ){
      vPositionOut = uStartPoint;
      vAgeOut = vAge;
      vVelocityOut = vVelocity;
      vLifeOut = vLife;
      return;
   }

   vec2 accel = force();
    /* Update parameters according to our simple rules.*/
   vPositionOut = vPosition + vVelocity * uDeltaTime;
   vLifeOut = vLife;
   vVelocityOut = vVelocity + accel * uDeltaTime;
   vAgeOut = vAge + uDeltaTime;
   
   if(length(vVelocityOut) > uMaxSpeed)
      vVelocityOut = vVelocity;
   if (vAgeOut >= vLife || isInsidePlanet) {
      float angle = -uSourceAngle - uBeta + rand(vec2(exp(vLife+vPositionOut.y), vLife))*(2.0*uBeta);
      float x = cos(angle);
      float y = sin(angle);
      vAgeOut = .0;
      vLifeOut = uMinLife + rand(vec2(vLifeOut*uDeltaTime, vLife))*(uMaxLife - uMinLife);
      vPositionOut = uStartPoint;
      vVelocityOut = vec2(x, y) * (uMinSpeed + rand(vec2(vLife, uDeltaTime*uDeltaTime))*(uMaxSpeed-uMinSpeed));
   }

}
