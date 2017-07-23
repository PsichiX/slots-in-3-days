precision mediump float;

uniform sampler2D sBase;
uniform vec2 uRectTopLeft;
uniform vec2 uRectBottomRight;

varying vec2 vTexCoord;

void main() {
  vec4 col = texture2D(sBase, vTexCoord);

  // check if rectangle contains pixel coord by using step function.
  vec2 topLeft = step(uRectTopLeft, vTexCoord);
  vec2 bottomRight = step(vTexCoord, uRectBottomRight);
  // calculate first step of float boolean 'and' operation.
  vec2 product = topLeft * bottomRight;
  // calculate second step of float boolean 'and' operation.
  col.a = 1.0 - dot(product, product.yx);

  gl_FragColor = col;
}
