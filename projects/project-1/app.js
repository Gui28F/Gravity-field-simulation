import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from '../../libs/utils.js';
import { vec2, vec3, flatten, subtract, dot } from '../../libs/MV.js';

// Buffers: particles before update, particles after update, quad vertices
let inParticlesBuffer, outParticlesBuffer, quadBuffer, newLife;

// Particle system constants

// Total number of particles
const N_PARTICLES = 100000;
// Maximum number of planets
const MAX_PLANETS = 10;
let drawPoints = true;
let drawField = true;


let time = undefined;

let uniStatus = {
    currMinLife: 2, minLifeLim: [1, 19],
    currMaxLife: 10, maxLifeLim: [2, 20],
    startPos: vec2(0, 0),
    currVMin: 0.1, vMin: 0.1,
    currVMax: 0.2, vMax: 0.2,
    sourceAngle: 0.0,
    betaAngle: Math.PI, varAngle: [-Math.PI, Math.PI],
    minSpeed: 0.1, maxSpeed: 0.2
};
let planets = [];


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
        gl.useProgram(updateProgram);
        let uMinSpeed = gl.getUniformLocation(updateProgram, "uMinSpeed");
        let uMaxSpeed = gl.getUniformLocation(updateProgram, "uMaxSpeed");
        let uBeta = gl.getUniformLocation(updateProgram, "uBeta");
        let uSourceAngle = gl.getUniformLocation(updateProgram, "uSourceAngle");
        const uStartPoint = gl.getUniformLocation(updateProgram, "uStartPoint");


        switch (event.key) {
            case "ArrowUp":
                if (uniStatus.varAngle[1] > uniStatus.betaAngle + Math.PI / 16) {
                    uniStatus.betaAngle += Math.PI / 16;
                    gl.uniform1f(uBeta, uniStatus.betaAngle);
                } else
                    gl.uniform1f(uBeta, uniStatus.betaAngle);
                break;
            case "ArrowDown":
                if (uniStatus.varAngle[0] <= uniStatus.betaAngle - Math.PI / 16) {
                    uniStatus.betaAngle -= Math.PI / 16;

                    gl.uniform1f(uBeta, uniStatus.betaAngle);
                } else
                    gl.uniform1f(uBeta, uniStatus.varAngle[0])
                break;
            case "ArrowLeft":
                uniStatus.sourceAngle = Math.round((uniStatus.sourceAngle - 0.1) * 10) / 10;
                gl.uniform1f(uSourceAngle, Math.round((uniStatus.sourceAngle - 0.1) * 10) / 10);
                break;
            case "ArrowRight":
                uniStatus.sourceAngle = Math.round((uniStatus.sourceAngle + 0.1) * 10) / 10;
                gl.uniform1f(uSourceAngle, Math.round((uniStatus.sourceAngle + 0.1) * 10) / 10);
                break;
            case 'q':
                if (uniStatus.currMinLife + 1 < uniStatus.currMaxLife &&
                    uniStatus.currMinLife + 1 <= uniStatus.minLifeLim[1])
                    uniStatus.currMinLife++;
                break;
            case 'a':
                if (uniStatus.currMinLife - 1 >= uniStatus.minLifeLim[0])
                    uniStatus.currMinLife--;
                break;
            case 'w':
                if (uniStatus.currMaxLife + 1 <= uniStatus.maxLifeLim[1])
                    uniStatus.currMaxLife++;
                break;
            case 's':
                if (uniStatus.currMaxLife - 1 >= uniStatus.maxLifeLim[0] &&
                    uniStatus.currMaxLife - 1 > uniStatus.currMinLife)
                    uniStatus.currMaxLife--;
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
                        gl.useProgram(updateProgram)
                        const p = getCursorPosition(canvas, event);
                        gl.useProgram(updateProgram);
                        gl.uniform2f(uStartPoint, p[0], p[1]);
                    }
                });
                break;
            case "PageUp":
                if (event.shiftKey) {
                    if (uniStatus.currVMin + 0.1 <= uniStatus.currVMax) {
                        uniStatus.currVMin = Math.round((uniStatus.currVMin + 0.1) * 10) / 10;;
                        gl.uniform1f(uMinSpeed, Math.round((uniStatus.currVMin + 0.1) * 10) / 10);
                    }
                }
                else {
                    uniStatus.currVMax = Math.round((uniStatus.currVMax + 0.1) * 10) / 10;
                    gl.uniform1f(uMaxSpeed, Math.round(uniStatus.currVMax * 10) / 10);
                }
                break;
            case "PageDown":
                if (event.shiftKey) {
                    if (uniStatus.currVMin - 0.1 >= 0.1) {
                        uniStatus.currVMin = Math.round((uniStatus.currVMin - 0.1) * 10) / 10;;
                        gl.uniform1f(uMinSpeed, Math.round(uniStatus.currVMin * 10) / 10);
                    }
                }
                else {
                    if (uniStatus.currVMin <= uniStatus.currVMax - 0.1 && uniStatus.currVMax - 0.1 >= uniStatus.currVMin) {
                        uniStatus.currVMax = Math.round((uniStatus.currVMax - 0.1) * 10) / 10;
                        gl.uniform1f(uMaxSpeed, Math.round(uniStatus.currVMax * 10) / 10);
                    }

                }
                break;
        }

    })
    let p1, mousedown;
    canvas.addEventListener("mousedown", function (event) {
        mousedown = true;
        p1 = getCursorPosition(canvas, event);
        drawPlanet(p1[0], p1[1], 0);
    });

    canvas.addEventListener("mousemove", function (event) {
        if (mousedown) {
            const p2 = getCursorPosition(canvas, event);
            let a = p1[0] - p2[0];
            let b = p1[1] - p2[1];
            let r = Math.sqrt(a * a + b * b);
            planets[planets.length - 1][2] = r;
        }
    });

    canvas.addEventListener("mouseup", function (event) {
        mousedown = false;
    })


    function getCursorPosition(canvas, event) {


        const mx = event.offsetX;
        const my = event.offsetY;

        let x = ((mx / canvas.width * 2) - 1);
        let y = (((canvas.height - my) / canvas.height * 2) - 1);

        return vec2(x * 1.5, y * 1.5 * canvas.height / canvas.width);
    }

    window.requestAnimationFrame(animate);

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
            const x = Math.random() * (1.5 - -1.5 + 1) - 1.5;
            const y = Math.random() * (1.5 - -1.5 + 1) - 1.5;

            data.push(x, y)
            // age
            data.push(0.0);

            // life
            const life = Math.random() * 6;
            data.push(life);
            // velocity
            data.push(0);
            data.push(0);
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
        gl.uniform1f(uSourceAngle, uniStatus.sourceAngle);
        const uBeta = gl.getUniformLocation(updateProgram, "uBeta");
        gl.uniform1f(uBeta, uniStatus.betaAngle);
        const uMinSpeed = gl.getUniformLocation(updateProgram, "uMinSpeed");
        gl.uniform1f(uMinSpeed, uniStatus.minSpeed);
        const uMaxSpeed = gl.getUniformLocation(updateProgram, "uMaxSpeed");
        gl.uniform1f(uMaxSpeed, uniStatus.maxSpeed);
        const uStartPoint = gl.getUniformLocation(updateProgram, "uStartPoint");
        gl.uniform2fv(uStartPoint, uniStatus.startPos);
        const uMinLife = gl.getUniformLocation(updateProgram, "uMinLife");
        gl.uniform1f(uMinLife, uniStatus.currMinLife);
        const uMaxLife = gl.getUniformLocation(updateProgram, "uMinLife");
        gl.uniform1f(uMaxLife, uniStatus.currMaxLife);
    }
    function drawPlanet(x, y, radius) {
        if (planets.length >= MAX_PLANETS)
            alert('Can not put more planets')
        else
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
        if (deltaTime > 0.05)
            deltaTime = 0;
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
        const uMinLife = gl.getUniformLocation(updateProgram, "uMinLife");
        const uMaxLife = gl.getUniformLocation(updateProgram, "uMinLife");
        gl.useProgram(updateProgram);


        for (let i = 0; i < planets.length; i++) {
            const uPosition = gl.getUniformLocation(updateProgram, "uPosition[" + i + "]");
            const uRadius = gl.getUniformLocation(updateProgram, "uRadius[" + i + "]");

            gl.uniform2fv(uPosition, vec2(planets[i][0], planets[i][1]));
            gl.uniform1f(uRadius, planets[i][2]);
        }
        gl.uniform1f(uDeltaTime, deltaTime);
        gl.uniform1f(uMinLife, uniStatus.currMinLife);
        gl.uniform1f(uMaxLife, uniStatus.currMaxLife);

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
        const uScale = gl.getUniformLocation(fieldProgram, "uScale");

        gl.uniform2fv(uScale, vec2(1.5, 1.5 * canvas.height / canvas.width));
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
        const uScale = gl.getUniformLocation(renderProgram, "uScale");
        gl.uniform2fv(uScale, vec2(1.5, 1.5 * canvas.height / canvas.width));
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.drawArrays(gl.POINTS, 0, nParticles);

    }
}


loadShadersFromURLS([
    "field-render.vert", "field-render.frag",
    "particle-update.vert", "particle-update.frag",
    "particle-render.vert", "particle-render.frag"
]
).then(shaders => main(shaders));
