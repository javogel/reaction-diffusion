precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_size;

const float COLOR_MIN = 0.10, COLOR_MAX = 0.055;

void main() {
  vec2 c = texture2D(u_image, gl_FragCoord.xy / u_size).xy;
  // float v = max(0.0, min(1.0, (c.x - COLOR_MIN) / (COLOR_MAX - COLOR_MIN)));
  gl_FragColor = vec4(c, 0.5, 1);
}