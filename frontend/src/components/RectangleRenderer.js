import VerticesRenderer from './VerticesRenderer';

export default class RectangleRenderer extends VerticesRenderer {

  get width() {
    return this._width;
  }

  set width(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._width = value;
    this._rebuild = true;
  }

  get height() {
    return this._height;
  }

  set height(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._height = value;
    this._rebuild = true;
  }

  get xOffset() {
    return this._xOffset;
  }

  set xOffset(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._xOffset = value;
    this._rebuild = true;
  }

  get yOffset() {
    return this._yOffset;
  }

  set yOffset(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._yOffset = value;
    this._rebuild = true;
  }

  constructor() {
    super();

    this._width = 1;
    this._height = 1;
    this._xOffset = 0;
    this._yOffset = 0;
    this._rebuild = true;
  }

  onRender(gl, renderer, deltaTime) {
    this.ensureVertices();

    super.onRender(gl, renderer, deltaTime);
  }

  ensureVertices() {
    if (!this._rebuild) {
      return;
    }

    const { _width, _height, _xOffset, _yOffset } = this;

    this.vertices = [
      -_xOffset,          -_yOffset,
      _width - _xOffset,  -_yOffset,
      _width - _xOffset,  _height - _yOffset,
      -_xOffset,          _height - _yOffset
    ];
    this.indices = [ 0, 1, 2, 2, 3, 0 ];
    this._rebuild = false;
  }

}
