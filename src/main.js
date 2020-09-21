// https://github.com/timhutton/webgl-reaction-diffusion
import './main.css';
const renderShader = require('./shaders/render-shader.frag')
const timestepShader = require('./shaders/timestep-shader.frag')
const vertexShader = require('./shaders/vertex-shader.vert')



var body = document.querySelector('body');
var W = body.offsetWidth, H = body.offsetHeight;

function init(img) {
	var canvas = document.createElement("canvas");

	canvas.id = "canvas";
	canvas.width = W;
	canvas.height = H;
	document.body.appendChild(canvas);


	var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	checkCompatibility(gl);

	var vertex_shader = createShader(gl, gl.VERTEX_SHADER, vertexShader),
		timestep_shader = createShader(gl, gl.FRAGMENT_SHADER, timestepShader),
		render_shader = createShader(gl, gl.FRAGMENT_SHADER, renderShader);

	var timestep_prog = createAndLinkProgram(gl, vertex_shader, timestep_shader),
		render_prog = createAndLinkProgram(gl, vertex_shader, render_shader);

	gl.useProgram(render_prog);
	loadVertexData(gl, render_prog);
	gl.uniform2f(gl.getUniformLocation(render_prog, "u_size"), W, H);

	gl.useProgram(timestep_prog);
	loadVertexData(gl, timestep_prog);
	gl.uniform2f(gl.getUniformLocation(timestep_prog, "u_size"), W, H);

	var initial_state = getInitialState(img);
	var t1 = newTexture(gl, initial_state),
		t2 = newTexture(gl, null),
		fb1 = newFramebuffer(gl, t1),
		fb2 = newFramebuffer(gl, t2);

	// Check the hardware can render to a float framebuffer
	// (https://developer.mozilla.org/en-US/docs/Web/WebGL/WebGL_best_practices)
	gl.useProgram(timestep_prog);
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb1);
	var fb_status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	console.log(fb_status)
	if (fb_status != gl.FRAMEBUFFER_COMPLETE) {
		fail("Cannot render to framebuffer: " + fb_status);
	}

	function step() {
		gl.useProgram(timestep_prog);

		for (var i = 0; i < 2; i++) {
			gl.bindTexture(gl.TEXTURE_2D, [t1, t2][i % 2]);
			gl.bindFramebuffer(gl.FRAMEBUFFER, [fb2, fb1][i % 2]);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}

		gl.useProgram(render_prog);
		gl.bindTexture(gl.TEXTURE_2D, t1);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	var af;
	function frame() {
		step();
		af = requestAnimationFrame(frame);
	}
	af = requestAnimationFrame(frame);
}

function getInitialState(img) {

	var a = new Float32Array(4 * W * H);

	for (var y = 0; y < H; y++) {
		for (var x = 0; x < W; x++) {
			var i = W * y + x,
				rx = (x - W / 2),
				ry = (y - H / 2),
				dd = Math.sqrt(rx * rx + ry * ry),
				in_stripe = dd > 50 && dd < 55 && ry < 20;
			const index = img.length - 4 * i
			const lightness = parseInt((img[index] + img[index + 1] + img[index + 2]) / 3);

			a[4 * i + 0] = 1.0;
			if (lightness < 50) {
				a[4 * i + 1] = 1.0;
			} else {
				a[4 * i + 1] = 0;
			}

		}
	}

	return a;
}

// Create, initialise, and bind a new texture
function newTexture(gl, initial_state) {
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.FLOAT, initial_state);

	return texture;
}

function newFramebuffer(gl, texture) {
	var fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

	return fb;
}

function loadVertexData(gl, prog) {
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

	var a_position = gl.getAttribLocation(prog, "a_position");
	gl.enableVertexAttribArray(a_position);
	gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
}

function createAndLinkProgram(gl, vertex_shader, fragment_shader) {
	var prog = gl.createProgram();
	gl.attachShader(prog, vertex_shader);
	gl.attachShader(prog, fragment_shader);
	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		fail("Failed to link program: " + gl.getProgramInfoLog(prog));
	}
	return prog;
}

function createShader(gl, shader_type, shader_code) {
	var shader = gl.createShader(shader_type);
	gl.shaderSource(shader, shader_code);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		var err = gl.getShaderInfoLog(shader);
		fail("Failed to compile shader: " + err);
	}
	return shader
}

function checkCompatibility(gl) {
	if (!gl) fail("WebGL is not supported");

	var float_texture_ext = gl.getExtension("OES_texture_float");
	if (!float_texture_ext) fail("Your browser does not support the WebGL extension OES_texture_float");
	window.float_texture_ext = float_texture_ext; // Hold onto it

	var max_texture_size = gl.getParameter(gl.MAX_TEXTURE_SIZE);
	if (max_texture_size < 512) fail("Your browser only supports " + max_texture_size + "x" + max_texture_size + " WebGL textures");
}

function fail(message) {
	var fail = document.createElement("p");
	fail.id = "fail";
	fail.appendChild(document.createTextNode(message));
	document.body.removeChild(document.getElementById("canvas"));
	document.body.appendChild(fail);
	throw message;
}


var canvas = document.createElement('canvas');
canvas.width = W;
canvas.height = H;
var context = canvas.getContext('2d');
var img = new Image();


img.onload = function () {
	context.translate(W, 0);
	context.scale(-1, 1);
	context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, W, H);
	let data = context.getImageData(0, 0, W, H).data;

	init(data)
}


img.src = './assets/3.jpg';
