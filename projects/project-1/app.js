import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from '../../libs/utils.js';
import { vec2, vec3, flatten, subtract, dot } from '../../libs/MV.js';

// Buffers: particles before update, particles after update, quad vertices
let inParticlesBuffer, outParticlesBuffer, quadBuffer, newLife;

// Particle system constants

// Total number of particles
const N_PARTICLES = 10000;

let drawPoints = true;
let drawField = true;


let time = undefined;

let uniStatus = {
    currMinLife: 2, minLifeLim: [1, 19], 
    currMaxLife: 10, maxLifeLim: [2, 20], 
    startPos: [0, 0], 
    currVMin: 0.1, vMin: 0.1, 
    currVMax: 0.2, vMax: 0.2,
    sourceAngle: 0.0,
    currMaxAngle: Math.PI, varAngle: [0, 2*Math.PI]
};

function main(shaders) {
    // Generate the canvas element to fill the entire page
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    /** type {WebGL2RenderingContext} */
    const gl = setupWebGL(canvas, { alpha: true });

    // Initialize GLSL programs    
    const fieldProgram = buildProgramFromSources(gl, shaders["field-render.vert"], shaders["field-render.frag"]);
    const renderProgram = buildProgramFromSources(gl, shaders["particle-render.vert"], shaders["particle-render.frag"]);
    const updateProgram = buildProgramFromSources(gl, shaders["particle-update.vert"], shaders["particle-update.frag"], ["vPositionOut", "vAgeOut", "vLifeOut", "vVelocityOut"]);
    gl.useProgram(fieldProgram);
    const canvasSize = gl.getUniformLocation(fieldProgram, "canvasSize");
    gl.uniform2fv(canvasSize, vec2(canvas.width, canvas.height));

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Enable Alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    buildQuad();
    buildParticleSystem(N_PARTICLES);

    window.addEventListener("resize", function (event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

    });


    window.addEventListener("keydown", function (event) {
        //console.log(event.key);
        gl.useProgram(updateProgram);
        let uMinSpeed = gl.getUniformLocation(updateProgram, "uMinSpeed");
        let uMaxSpeed = gl.getUniformLocation(updateProgram, "uMaxSpeed");
        let uMaxAngle = gl.getUniformLocation(updateProgram, "uMaxAngle");
        let uLife = gl.getUniformLocation(updateProgram, "uLife");
        let uSourceAngle = gl.getUniformLocation(updateProgram, "uSourceAngle");
        const uStartPoint = gl.getUniformLocation(updateProgram, "uStartPoint");


        switch (event.key) {
            case "ArrowUp":
                if (uniStatus.varAngle[0] <= uniStatus.currMaxAngle + 0.1 && uniStatus.varAngle[1] >= uniStatus.currMaxAngle + 0.1) {
                    uniStatus.currMaxAngle += 0.1;
                    gl.uniform1f(uMaxAngle, uniStatus.currMaxAngle);
                }
                break;
            case "ArrowDown":
                if (uniStatus.varAngle[0] <= uniStatus.currMaxAngle - 0.1 && uniStatus.varAngle[1] >= uniStatus.currMaxAngle - 0.1) {
                    uniStatus.currMaxAngle -= 0.1;
                    gl.uniform1f(uMaxAngle, uniStatus.currMaxAngle);
                }
                console.log(uniStatus.currMaxAngle);
                break;
            case "ArrowLeft":
                uniStatus.sourceAngle += 0.1
                gl.uniform1f(uSourceAngle, uniStatus.sourceAngle);
                break;
            case "ArrowRight":
                uniStatus.sourceAngle -= 0.1
                gl.uniform1f(uSourceAngle, uniStatus.sourceAngle);
                break;
            case 'q':
                 if (uniStatus.currMinLife + 1 <= uniStatus.minLifeLim[1]) {
                    uniStatus.currMinLife++;
                    const lifes = [];
                    for(let i = 0; i < N_PARTICLES; i++){
                        let life = Math.random() * (uniStatus.currMaxLife - uniStatus.currMinLife + 1) + 2;
                        lifes.push(life);
                    }    
                    newLife = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, newLife);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(lifes), gl.STREAM_DRAW);

                    const vLife = gl.getAttribLocation(updateProgram, "vLife");
                    gl.vertexAttribPointer(vLife, 1, gl.FLOAT, false, 0, 0);
                    console.log(uniStatus.currMinLife);
                }
                break;
            case 'a':
                if (uniStatus.currMinLife - 1 >= uniStatus.minLifeLim[0]) {
                    uniStatus.currMinLife--;
                    console.log(uniStatus.currMinLife);
                    let life = Math.random() * (uniStatus.currMaxLife - uniStatus.currMinLife + 1) + 2;
                    gl.uniform1f(uLife, life);
                }
                break;
            case 'w':
                if (uniStatus.currMaxLife + 1 <= uniStatus.maxLifeLim[1]) {
                    uniStatus.currMaxLife++;
                    console.log(uniStatus.currMaxLife);
                    let life = Math.random() * (uniStatus.currMaxLife - uniStatus.currMinLife + 1) + 2;
                    gl.uniform1f(uLife, life);
                }
                break;
            case 's':
                if (uniStatus.currMaxLife - 1 >= uniStatus.maxLifeLim[0]) {
                    uniStatus.currMaxLife--;
                    const lifes = [];
                    for(let i = 0; i < N_PARTICLES; i++){
                        let life = Math.random() * (uniStatus.currMaxLife - uniStatus.currMinLife + 1) + 2;
                        lifes.push(life);
                    }    
                    newLife = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, newLife);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(lifes), gl.STREAM_DRAW);

                    const vLife = gl.getAttribLocation(updateProgram, "vLife");
                    gl.vertexAttribPointer(vLife, 1, gl.FLOAT, false, 0, 0);
                    console.log(uniStatus.currMaxLife);
                }
                break;
            case '0':
                drawField = !drawField;
                break;
            case '9':
                drawPoints = !drawPoints;
                break;
            case 'Shift':
                window.addEventListener("mousemove", function (event) {
                    if (event.shiftKey) {
                        const p = getCursorPosition(canvas, event);
                        gl.useProgram(updateProgram);
                        gl.uniform2f(uStartPoint, p[0], p[1]);
                    }
                    //console.log(p);
                });
                break;
            case "PageUp":
                if (event.shiftKey) {
                    if (uniStatus.currVMax + 0.1 <= uniStatus.currVMax) {
                        uniStatus.currVMax += 0.1;
                        gl.uniform1f(uMinSpeed, uniStatus.currVMax);
                    }
                    console.log(uniStatus.currVMax);
                }
                else {
                    console.log(event);
                    uniStatus.currVMax += 0.1
                    gl.uniform1f(uMaxSpeed, uniStatus.currVMax);
                }
                break;
            case "PageDown":
                if (event.shiftKey) {
                    if (uniStatus.currVMin - 0.1 >= uniStatus.vMin) {
                        uniStatus.currVMin -= 0.1;
                        gl.uniform1f(uMinSpeed, uniStatus.currVMin);
                    }
                }
                else {
                    if (uniStatus.currVMax - 0.1 >= uniStatus.currVMin) {
                        uniStatus.currVMax -= 0.1
                        gl.uniform1f(uMaxSpeed, uniStatus.currVMax);
                    }
                }
                break;
        }

    })
    let p1;
    canvas.addEventListener("mousedown", function (event) {
         p1 = getCursorPosition(canvas, event);
    });
    canvas.addEventListener("mouseup", function (event) {
        const p2 = getCursorPosition(canvas, event);
        let  a = p1[0] - p2[0];
        let b = p1[1] - p2[1];
        let r = Math.sqrt(a * a + b * b);
        drawPlanet(p1[0], p1[1], r);
    })


    function getCursorPosition(canvas, event) {


        const mx = event.offsetX;
        const my = event.offsetY;

        let x = ((mx / canvas.width * 2) - 1);
        let y = (((canvas.height - my) / canvas.height * 2) - 1);

        return vec2(x, y);
    }

    window.requestAnimationFrame(animate);
    let planets = [];

    function buildQuad() {
        const vertices = [-1.0, 1.0, -1.0, -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0, -1.0, 1.0, 1.0];

        quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    }

    function buildParticleSystem(nParticles) {
        const data = [];

        for (let i = 0; i < nParticles; ++i) {
            //position
            // const x = Math.random()-0.5;
            // const y = Math.random()-0.5;


            data.push(uniStatus.startPos[0]); data.push(uniStatus.startPos[1]);

            // age
            data.push(0.0);

            // life
            const life = Math.random() * 6;
            data.push(life);
            /* gl.useProgram(updateProgram)
             let uMinLife = gl.getUniformLocation(updateProgram, "uMinLife");
             gl.uniform1f(uMinLife, life);
             let uMaxLife = gl.getUniformLocation(updateProgram, "uMinLife");
             gl.uniform1f(uMaxLife, life);*/
            // velocity
            data.push(30000.);
            data.push(30000.);
        }


        inParticlesBuffer = gl.createBuffer();
        outParticlesBuffer = gl.createBuffer();

        // Input buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, inParticlesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STREAM_DRAW);

        // Output buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, outParticlesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STREAM_DRAW);
        gl.useProgram(updateProgram);

        const uSourceAngle = gl.getUniformLocation(updateProgram, "uSourceAngle");
        gl.uniform1f(uSourceAngle, 0.);
        const uMinAngle = gl.getUniformLocation(updateProgram, "uMinAngle");
        gl.uniform1f(uMinAngle, 0.);
        const uMaxAngle = gl.getUniformLocation(updateProgram, "uMaxAngle");
        gl.uniform1f(uMaxAngle, Math.PI);
        const uMinSpeed = gl.getUniformLocation(updateProgram, "uMinSpeed");
        gl.uniform1f(uMinSpeed, 0.1);
        const uMaxSpeed = gl.getUniformLocation(updateProgram, "uMaxSpeed");
        gl.uniform1f(uMaxSpeed, 0.2);
    }
    function drawPlanet(x, y, radius) {
        planets.push(vec3(x, y, radius))
    }


    function animate(timestamp) {


        let deltaTime = 0;
        if (time === undefined) {        // First time
            time = timestamp / 1000;
            deltaTime = 0;
        }
        else {                          // All other times
            deltaTime = timestamp / 1000 - time;
            time = timestamp / 1000;
        }

        window.requestAnimationFrame(animate);

        // Clear framebuffer
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(updateProgram);


        if (drawField)
            drawQuad();

        updateParticles(deltaTime);
        if (drawPoints) drawParticles(outParticlesBuffer, N_PARTICLES);
        swapParticlesBuffers();
    }

    function updateParticles(deltaTime) {
        // Setup uniforms
        const uDeltaTime = gl.getUniformLocation(updateProgram, "uDeltaTime");

        gl.useProgram(updateProgram);
        for (let i = 0; i < planets.length; i++) {
            const uPosition = gl.getUniformLocation(updateProgram, "uPosition[" + i + "]");
            const uRadius = gl.getUniformLocation(updateProgram, "uRadius[" + i + "]");

            gl.uniform2fv(uPosition, vec2(planets[i][0], planets[i][1]));
            gl.uniform1f(uRadius, planets[i][2]);
        }
        gl.uniform1f(uDeltaTime, deltaTime);

        // Setup attributes
        const vPosition = gl.getAttribLocation(updateProgram, "vPosition");
        const vAge = gl.getAttribLocation(updateProgram, "vAge");
        const vLife = gl.getAttribLocation(updateProgram, "vLife");
        const vVelocity = gl.getAttribLocation(updateProgram, "vVelocity");
        gl.bindBuffer(gl.ARRAY_BUFFER, inParticlesBuffer);

        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(vAge, 1, gl.FLOAT, false, 24, 8);
        gl.vertexAttribPointer(vLife, 1, gl.FLOAT, false, 24, 12);
        gl.vertexAttribPointer(vVelocity, 2, gl.FLOAT, false, 24, 16);

        gl.enableVertexAttribArray(vPosition);
        gl.enableVertexAttribArray(vAge);
        gl.enableVertexAttribArray(vLife);
        gl.enableVertexAttribArray(vVelocity);

        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, outParticlesBuffer);
        gl.enable(gl.RASTERIZER_DISCARD);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, N_PARTICLES);
        gl.endTransformFeedback();
        gl.disable(gl.RASTERIZER_DISCARD);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    }

    function swapParticlesBuffers() {
        let auxBuffer = inParticlesBuffer;
        inParticlesBuffer = outParticlesBuffer;
        outParticlesBuffer = auxBuffer;
    }

    function drawQuad() {

        gl.useProgram(fieldProgram);

        for (let i = 0; i < planets.length; i++) {
            const uPosition = gl.getUniformLocation(fieldProgram, "uPosition[" + i + "]");
            const uRadius = gl.getUniformLocation(fieldProgram, "uRadius[" + i + "]");

            gl.uniform2fv(uPosition, vec2(planets[i][0], planets[i][1]));
            gl.uniform1f(uRadius, planets[i][2]);
        }
        const scale = gl.getUniformLocation(fieldProgram, "scale");

        gl.uniform2fv(scale, vec2(1.5, 1.5 * canvas.height / canvas.width));
        // Setup attributes
        const vPosition = gl.getAttribLocation(fieldProgram, "vPosition");

        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.enableVertexAttribArray(vPosition);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function drawParticles(buffer, nParticles) {

        gl.useProgram(renderProgram);

        // Setup attributes
        const vPosition = gl.getAttribLocation(renderProgram, "vPosition");

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.drawArrays(gl.POINTS, 0, nParticles);

    }
   //drawPlanet(0.3, 0, 0.15);
   // drawPlanet(-0.3, 0.3, 0.2);
    //drawPlanet(-0.3, -0.3, 0.1);
}


loadShadersFromURLS([
    "field-render.vert", "field-render.frag",
    "particle-update.vert", "particle-update.frag",
    "particle-render.vert", "particle-render.frag"
]
).then(shaders => main(shaders));
