precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_size;

const float // Parameters from Ready: Patterns > FitzHugh-Nagomo >
            // ising_regime.vti
    A0 = -0.01,
    A1 = 2.0, EPSILON = 0.1;

vec2 DELTA = vec2(2.0, 1.0);

const float TIMESTEP = 0.03, SCALE = 1.0;

void main() {
  vec2 p = gl_FragCoord.xy, n = p + vec2(0.0, 1.0), e = p + vec2(1.0, 0.0),
       s = p + vec2(0.0, -1.0), w = p + vec2(-1.0, 0.0);

  vec2 val = texture2D(u_image, p / u_size).xy,
       laplacian = texture2D(u_image, n / u_size).xy +
                   texture2D(u_image, s / u_size).xy +
                   texture2D(u_image, e / u_size).xy +
                   texture2D(u_image, w / u_size).xy - 4.0 * val;

  vec2 delta =
      vec2(val.x - val.x * val.x * val.x - val.y + laplacian.x * SCALE,
           EPSILON * (val.x - A1 * val.y - A0) + DELTA * laplacian.y * SCALE);

  gl_FragColor = vec4(val + delta * TIMESTEP, 0, 0);
}