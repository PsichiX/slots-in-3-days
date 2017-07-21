attribute vec3 aPosition;
attribute vec4 aColor;

varying vec4 vColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

void main() {
  vColor = aColor;
  gl_Position = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);
}
