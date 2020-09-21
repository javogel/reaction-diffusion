precision mediump float;
uniform sampler2D u_image;
uniform vec2 u_size;

// const float // Parameters from Ready: Patterns > FitzHugh-Nagomo >
//             // ising_regime.vti
//     A0 = -0.01,
//     A1 = 2.0, EPSILON = 0.1;

//             vec2 DELTA = vec2(2.0, 1.0);
// const float TIMESTEP = 0.03, SCALE = 1.0;

const float f = 0.055, k = 0.062, da = 1.0, db = 0.5;

void main() {

  vec2 p = gl_FragCoord.xy, n = p + vec2(0.0, 1.0), e = p + vec2(1.0, 0.0),
       s = p + vec2(0.0, -1.0), w = p + vec2(-1.0, 0.0),
       se = p + vec2(1.0, -1.0), sw = p + vec2(-1.0, -1.0),
       ne = p + vec2(1.0, 1.0), nw = p + vec2(-1.0, 1.0);

  vec2 val = texture2D(u_image, p / u_size).xy,
       laplacian = val.xy * -1. + texture2D(u_image, n / u_size).xy * 0.2 +
                   texture2D(u_image, s / u_size).xy * 0.2 +
                   texture2D(u_image, e / u_size).xy * 0.2 +
                   texture2D(u_image, w / u_size).xy * 0.2 +
                   texture2D(u_image, se / u_size).xy * 0.05 +
                   texture2D(u_image, sw / u_size).xy * 0.05 +
                   texture2D(u_image, ne / u_size).xy * 0.05 +
                   texture2D(u_image, nw / u_size).xy * 0.05;

  //   vec2 delta =
  //       vec2(val.x - val.x * val.x * val.x - val.y + laplacian.x * SCALE,
  //            EPSILON * (val.x - A1 * val.y - A0) + DELTA * laplacian.y *
  //            SCALE);

  float ab_squared = val.x * val.y * val.y;
  vec2 delta = vec2(da * laplacian.x - ab_squared + f * (1. - val.x),
                    db * laplacian.y + ab_squared - val.y * (k + f));

  gl_FragColor = vec4(val + delta * 0.8, 0, 0);
}