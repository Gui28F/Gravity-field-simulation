import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from '../../libs/utils.js';
import { vec2, flatten, subtract, dot } from '../../libs/MV.js';

// Buffers: particles before update, particles after update, quad vertices
let inParticlesBuffer, outParticlesBuffer, quadBuffer, planetsBuffer;

// Particle system constants

// Total number of particles
const N_PARTICLES = 1000;

let drawPoints = true;
let drawField = true;


let time = undefined;

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
        switch (event.key) {
            case "PageUp":
                break;
            case "PageDown":
                break;
            case "ArrowUp":
                break;
            case "ArrowDown":
                break;
            case "ArrowLeft":
                break;
            case "ArrowRight":
                break;
            case 'q':
                break;
            case 'a':
                break;
            case 'w':
                break;
            case 's':
                break;
            case '0':
                drawField = !drawField;
                break;
            case '9':
                drawPoints = !drawPoints;
                break;
            case 'Shift':
                canvas.addEventListener("mousemove", function (event) {
                    if (event.shiftKey) {
                        const p = getCursorPosition(canvas, event);
                        gl.useProgram(updateProgram);
                        const uStartPoint = gl.getUniformLocation(updateProgram, "uStartPoint");
                        gl.uniform2f(uStartPoint, p[0], p[1]);
                    }
                    //console.log(p);
                });


        }
    })

    canvas.addEventListener("mousedown", function (event) {
    });



    canvas.addEventListener("mouseup", function (event) {
    })


    function getCursorPosition(canvas, event) {


        const mx = event.offsetX;
        const my = event.offsetY;

        let x = ((mx / canvas.width * 2) - 1);
        let y = (((canvas.height - my) / canvas.height * 2) - 1);

        return vec2(x, y);
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
            // const x = Math.random()-0.5;
            // const y = Math.random()-0.5;
            const x = 0;
            const y = 0;

            data.push(x); data.push(y);

            // age
            data.push(0.0);

            // life
            const life = Math.random() * (7 - 2 + 1) + 2;
            data.push(life);

            // velocity
            data.push(0.1 * (Math.random() - 0.5));
            data.push(0.1 * (Math.random() - 0.5));
        }

        inParticlesBuffer = gl.createBuffer();
        outParticlesBuffer = gl.createBuffer();

        // Input buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, inParticlesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STREAM_DRAW);

        // Output buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, outParticlesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STREAM_DRAW);
    }
    let planets = [];
    function drawPlanet(x, y, radius) {
        let frequency = 0.0087;
        let r, g, b;
        let vertices = [];
        for (let i = 0; i < 723; i++) {
            r = Math.sin(frequency * i + 0) * 125 / 255 + 128 / 255;
            g = Math.sin(frequency * i + 2 * Math.PI / 3) * 125 / 255 + 128 / 255;
            b = Math.sin(frequency * i + 4 * Math.PI / 3) * 125 / 255 + 128 / 255;

            let angle = 2 * Math.PI * i / (722);
            vertices.push(x, y)
            vertices.push(r, g, b);
            let x2 = x + radius * Math.cos(angle);
            let y2 = y + radius * Math.sin(angle);
            vertices.push(x2, y2)
            vertices.push(r, g, b);

        }
        planets.push({ x: x, y: y, r: radius, verts: vertices });


        let allVertices = [];
        planets.forEach(p => allVertices.push(p.verts));
        //gl.deleteBuffer(planetsBuffer);
        planetsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, planetsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(allVertices), gl.STATIC_DRAW);
    }


    drawPlanet(0.2, 0, 0.8)

    function dist(pos) {
        return Math.pow(Math.pow(pos[0] - 0.3, 2.) + Math.pow(pos[1] - 0.3, 2.), 0.5);
    }
    function maxForce() {
        let force = 0.;
        for (let i = 0; i < 1; i++) {
            let m = 4. * Math.PI * Math.pow(planets[i].r, 3.) / 3. * (5.51* Math.pow(10.,3.));
            if (planets[i].x != 0 || planets[i].y != 0)
                force += (6.67 * Math.pow(10., -11.)) * m / Math.pow(dist([planets[i].x, planets[i].y]), 2.);
        }

        return (6.371 * Math.pow(10., 6.)) * force;
    }
    console.log(maxForce())
    function animate(timestamp) {
        gl.useProgram(fieldProgram);
        for (let i = 0; i < planets.length; i++) {
            const uPosition = gl.getUniformLocation(fieldProgram, "uPosition[" + i + "]");
            gl.uniform2fv(uPosition, vec2(planets[i].x, planets[i].y));
            const uRadius = gl.getUniformLocation(fieldProgram, "uRadius[" + i + "]");
            gl.uniform1f(uRadius, planets[i].r);
        }


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

        const uMinAngle = gl.getUniformLocation(updateProgram, "uMinAngle");
        gl.uniform1f(uMinAngle, 0.79);
        const uMaxAngle = gl.getUniformLocation(updateProgram, "uMaxAngle");
        gl.uniform1f(uMaxAngle, 2.37);
        const uMinSpeed = gl.getUniformLocation(updateProgram, "uMinSpeed");
        gl.uniform1f(uMinSpeed, 0.1);
        const uMaxSpeed = gl.getUniformLocation(updateProgram, "uMaxSpeed");
        gl.uniform1f(uMaxSpeed, 0.3);
        if (drawField) {
            drawQuad();
            //drawPlanets(planetsBuffer);
        }
        updateParticles(deltaTime);
        if (drawPoints) drawParticles(outParticlesBuffer, N_PARTICLES);
        swapParticlesBuffers();
    }

    function updateParticles(deltaTime) {
        // Setup uniforms
        const uDeltaTime = gl.getUniformLocation(updateProgram, "uDeltaTime");

        gl.useProgram(updateProgram);

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
    function drawPlanets(buffer) {
        gl.useProgram(fieldProgram);
        const vPosition = gl.getAttribLocation(fieldProgram, "vPosition");
        const vColor = gl.getAttribLocation(fieldProgram, "vColor");
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 4 * 5, 0);
        gl.enableVertexAttribArray(vPosition)
        gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 4 * 5, 4 * 2);
        gl.enableVertexAttribArray(vColor);
        for (let i = 0; i < planets.length; i++) {
            gl.drawArrays(gl.TRIANGLE_STRIP, i * 723 * 2, 723 * 2);
        }


    }
}


loadShadersFromURLS([
    "field-render.vert", "field-render.frag",
    "particle-update.vert", "particle-update.frag",
    "particle-render.vert", "particle-render.frag"
]
).then(shaders => main(shaders));
