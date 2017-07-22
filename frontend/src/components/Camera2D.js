import Component from '../systems/EntitySystem/Component';
import { mat4 } from 'gl-matrix';

const ZoomMode = {
  PIXEL_PERFECT: 'pixel-perfect',
  KEEP_ASPECT: 'keep-aspect'
};

export default class Camera2D extends Component {

  static get ZoomMode() {
    return ZoomMode;
  }

  get zoom() {
    return this._zoom;
  }

  set zoom(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number');
    }

    this._zoom = value;
  }

  get zoomOut() {
    const { _zoom } = this;
    return _zoom !== 0 ? 1 / _zoom : 1;
  }

  set zoomOut(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number');
    }

    this._zoom = value !== 0 ? 1 / value : 1;
  }

  get near() {
    return this._near;
  }

  set near(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number');
    }

    this._near = value;
  }

  get far() {
    return this._far;
  }

  set far(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number');
    }

    this._far = value;
  }

  get zoomMode() {
    return this._zoomMode;
  }

  set zoomMode(value) {
    if (typeof value !== 'string') {
      throw new Error('`value` is not type of String');
    }

    this._zoomMode = value;
  }

  constructor() {
    super();

    this._zoom = 1;
    this._near = -1;
    this._far = 1;
    this._zoomMode = ZoomMode.PIXEL_PERFECT;
  }

  onAction(name, ...args) {
    if (name === 'render') {
      return this.onRender(...args);
    }
  }

  onRender(gl, renderer, deltaTime) {
    let { width, height } = renderer.canvas;
    if ((width | 0) === 0 || (height | 0) === 0) {
      mat4.identity(renderer.projectionMatrix);
      return;
    }

    const { _zoom, _zoomMode } = this;
    const scale = _zoom > 0 ? 1 / _zoom : 0;

    if (_zoomMode === ZoomMode.KEEP_ASPECT) {
      if (width >= height) {
        width = width / height;
        height = 1;
      } else {
        height = height / width;
        width = 1;
      }
    }

    const halfWidth = width * 0.5 * scale;
    const halfHeight = height * 0.5 * scale;

    mat4.ortho(
      renderer.projectionMatrix,
      -halfWidth,
      halfWidth,
      halfHeight,
      -halfHeight,
      this._near,
      this._far
    );
  }

}
