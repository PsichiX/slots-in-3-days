precision mediump float;

uniform sampler2D sBase;

varying vec2 vTexCoord;

void main() {
  gl_FragColor = texture2D(sBase, vTexCoord);
}
