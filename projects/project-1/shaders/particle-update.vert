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
uniform float uSourceAngle;
//uniform bool uUseStartPoint;
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


vec2 force(){
   vec2 force = vec2(0.,0.);
   vec2 pos = vPosition.xy;
   for(int i = 0; i < MAX_PLANETS; i++){
      if(uRadius[i] != 0. ){
         vec2 d = normalize(uPosition[i] - pos);
         float m = 4. * PI * pow(uRadius[i] * RE,3.)/3. * rho;
         float f = G * m/pow(length(uPosition[i]- pos)*RE,2.);
         
        /*if(length(uPosition[i]- pos)<uRadius[i]*1.5){
           //d = vec2(vPosition.x, vPosition.y);
           /* float x = -uRadius[i]*RE* pow(2.*PI*uDeltaTime,2.)*cos(2.*PI*uDeltaTime*uDeltaTime);
            float y = uRadius[i]*RE* pow(2.*PI*uDeltaTime,2.)*sin(2.*PI*uDeltaTime*uDeltaTime);
            d = vec2(x,y);
          d = vec2(cos(d.x), sin(d.x));
            d = vec2(x, y);


            vec2 d2 = vec2(d.y, -d.x);
            force += 2.*f * d2;
            force -= 2.*f*d;
         }else*/
            force += f * d ;
         

      }
   }
    return force;
}

bool intersectedPlanet(vec2 pos){
   for(int i = 0; i < MAX_PLANETS; i++){
      vec2 uPos = uPosition[i];
      if(pow(pos.x-uPos.x,2.)+pow(pos.y-uPos.y,2.)<pow(uRadius[i],2.))
         return true;
   }
   return false;
}

void main() {

    /* Update parameters according to our simple rules.*/
   vPositionOut = vPosition + vVelocity * uDeltaTime;
   vLifeOut = vLife;
   bool isInsidePlanet = intersectedPlanet(vPositionOut);
   vec2 accel = force();
   vVelocityOut = vVelocity + accel * uDeltaTime;
   if(length(vVelocityOut)>uMaxSpeed)
      vVelocityOut = vVelocity;
      vAgeOut = vAge + uDeltaTime;
     /* float angle = acos(length(accel));
      float x = cos(angle)*vPosition.x - sin(angle)*vPosition.y;
      float y = sin(angle)*vPosition.x + cos(angle)*vPosition.y;
      
      vVelocityOut = vVelocity - accel + accel*vec2(x,y) * uDeltaTime;
   }*/
   if(isInsidePlanet)
      vAgeOut = vLife;
   
   if (vAgeOut >= vLife ) {
      // It's all up to you!
      float angle = uMinAngle + rand(vec2(sin(vPosition.x), vLife))*(uMaxAngle - uMinAngle);
      float x = cos(angle-PI/2.-uSourceAngle);
      float y = sin(angle-PI/2.-uSourceAngle);
      vAgeOut = .0;
      vLifeOut = uMinLife + rand(vec2(vPosition.x, vLife))*(uMaxLife - uMinLife);;
     // if(uUseStartPoint){
      vPositionOut = uStartPoint;
      vVelocityOut = vec2(x, y ) * rand(vec2(vPosition.y, uMaxSpeed))*(uMaxSpeed);
     /* if(isInsidePlanet){
         vVelocityOut = vVelocity;
         vLifeOut = vLife;
      }
     }else{
         vPositionOut = vPosition;
         if(isInsidePlanet){
            vPositionOut = 1.+vec2(rand(vec2(x,y)),rand(vec2(x,y)));
            vVelocityOut = vVelocity;
            vLifeOut = vLife;
         }
      }*/

   }

}