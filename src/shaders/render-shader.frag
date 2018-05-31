precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_size;

const float COLOR_MIN = 0.10, COLOR_MAX = 0.055;

void main() {
  float c = texture2D(u_image, gl_FragCoord.xy / u_size).y,
        v = max(0.0, min(1.0, (c - COLOR_MIN) / (COLOR_MAX - COLOR_MIN)));
  gl_FragColor = vec4(v, v, v, 1);
}