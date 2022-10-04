precision mediump float;

/* Number of seconds (possibly fractional) that has passed since the last
   update step. */
uniform float uDeltaTime;
uniform vec2 uForce;
varying vec2 uStartPoint;
uniform float uMinAngle;
uniform float uMaxAngle;
uniform float uMinSpeed;
uniform float uMaxSpeed;
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


void main() {
   if(vAgeOut == 0.)
      uStartPoint = vPosition;
    /* Update parameters according to our simple rules.*/
      vPositionOut = vPosition + vVelocity * uDeltaTime;
      vLifeOut = vLife;
      vec2 accel = vec2(0.0);
      vVelocityOut = vVelocity + accel * uDeltaTime;
      vAgeOut = vAge + uDeltaTime;
   if (vAgeOut >= vLife || vAgeOut == 0.) {
      // It's all up to you!
      float angle = uMinAngle + rand(vec2(vLife, vLife*2.))*(uMaxAngle - uMinAngle);
      float x = cos(angle);
      float y = sin(angle);
      vPositionOut = uStartPoint;
      vAgeOut = .0;
      vLifeOut = vLife;
      vVelocityOut = vec2(x, y) * (rand(vec2(vLife*2., vLife*4.)) * (uMaxSpeed - uMinSpeed));
   }

}