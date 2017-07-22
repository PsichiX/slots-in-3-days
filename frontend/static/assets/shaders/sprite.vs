attribute vec2 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelView;
uniform mat4 uProjection;

varying vec2 vTexCoord;

void main() {
  gl_Position = uProjection * uModelView * vec4(aPosition, 0.0, 1.0);
  vTexCoord = aTexCoord;
}
