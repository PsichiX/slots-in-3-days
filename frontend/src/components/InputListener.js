import Script from './Script';
import Camera2D from './Camera2D';
import { vec2, mat4 } from 'gl-matrix';

const cachedLocalVec = vec2.create();
const cachedInverseMatrix = mat4.create();

export default class InputListener extends Script {

  get width() {
    return this._width;
  }

  set width(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._width = value;
  }

  get height() {
    return this._height;
  }

  set height(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._height = value;
  }

  get xOffset() {
    return this._xOffset;
  }

  set xOffset(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._xOffset = value;
  }

  get yOffset() {
    return this._yOffset;
  }

  set yOffset(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._yOffset = value;
  }

  get camera() {
    return this._camera;
  }

  set camera(value) {
    if (typeof value === 'string') {
      const node = this.entity.findEntity(value);

      if (!node) {
        throw new Error(`Cannot find entity node: ${value}`);
      }

      value = node.getComponent('Camera2D');
    }

    if (!(value instanceof Camera2D)) {
      throw new Error('`value` is not type of Camera2D');
    }

    this._camera = value;
  }

  constructor() {
    super();

    this._width = 1;
    this._height = 1;
    this._xOffset = 0;
    this._yOffset = 0;
    this._camera = null;
  }

  onAttach() {
    this.listenTo =
      Script.EventFlags.MOUSE_DOWN |
      Script.EventFlags.MOUSE_UP;

    const { __camera } = this;

    if (!!__camera) {
      this.camera = __camera;
      delete this.__camera;
    }
  }

  onDetach() {
    this.listenTo = Script.EventFlags.NONE;
  }

  onPropertySetup(name, value) {
    if (name === 'camera') {
      this.__camera = value;
    } else {
      super.onPropertySetup(name, value);
    }
  }

  onMouseDown(unitVec, screenVec) {
    this._convertUnitToLocalCoords(cachedLocalVec, unitVec);

    if (this._isPointInBoundingBox(cachedLocalVec)) {
      this.entity.performAction('click', cachedLocalVec);
    }
  }

  onMouseUp(unitVec, screenVec) {
    this._convertUnitToLocalCoords(cachedLocalVec, unitVec);

    if (this._isPointInBoundingBox(cachedLocalVec)) {
      this.entity.performAction('click-release', cachedLocalVec);
    }
  }

  _isPointInBoundingBox(localVec) {
    const { _width, _height, _xOffset, _yOffset } = this;
    const x = localVec[0];
    const y = localVec[1];
    const left = -_xOffset;
    const right = _width - _xOffset;
    const top = -_yOffset;
    const bottom = _height - _yOffset;

    return x >= left && x <= right && y >= top && y <= bottom;
  }

  _convertUnitToLocalCoords(out, unitVec) {
    const { _camera, entity } = this;

    if (!_camera) {
      throw new Error('There is no Camera2D bound to InputListener!');
    }

    mat4.multiply(
      cachedInverseMatrix,
      entity.inverseTransform,
      _camera.inverseProjectionMatrix
    );

    vec2.transformMat4(out, unitVec, cachedInverseMatrix);
  }

}
