precision highp float;
varying vec3 vPositionOut;

varying float fOpacity;
varying vec3 fColor;
void main()
{
    gl_FragColor = vec4(fColor,fOpacity);

}