import System from './System';

export default class RenderSystem extends System {

  constructor(canvas) {
    super();

    this._animationFrame = 0;
    this._lastTimestamp = null;
    this._canvas = null;
    this._context = null;

    this._setup(canvas);
  }

  dispose() {
    this._stopAnimation();

    this._canvas = null;
    this._context = null;
  }

  onRegister() {
    this._startAnimation();
  }

  onUnregister() {
    this._stopAnimation();
  }

  _setup(canvas) {
    if (typeof canvas !== 'string') {
      throw new Error('`canvas` is not type of String!');
    }

    canvas = this._canvas = document.getElementById('screen-0');

    const options = { alpha: false };
    const gl = this._context =
      canvas.getContext('webgl', options) ||
      canvas.getContext('experimental-webgl', options);

    if (!gl) {
      throw new Error('Cannot create WebGL context!');
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  _startAnimation() {
    this._stopAnimation();

    this._lastTimestamp = performance.now();
    this._requestFrame();
  }

  _stopAnimation() {
    cancelAnimationFrame(this._lastTimestamp);
    this._lastTimestamp = null;
  }

  _requestFrame() {
    // wrap in arrow function to keep `this` context of `_animationFrame` method
    this._animationFrame = requestAnimationFrame(
      timestamp => this._onFrame(timestamp)
    );
  }

  _onFrame(timestamp) {
    const deltaTime = timestamp - this._lastTimestamp;
    this._lastTimestamp = timestamp;

    System.events.trigger('render', deltaTime);
    this._requestFrame();
  }

}
