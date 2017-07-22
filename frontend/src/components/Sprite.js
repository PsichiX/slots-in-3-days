import RectangleRenderer from './RectangleRenderer';

export default class Sprite extends RectangleRenderer {

  ensureVertices() {
    if (!this._rebuild) {
      return;
    }
    const { _width, _height, _xOffset, _yOffset } = this;

    this.vertices = [
      -_xOffset,          -_yOffset,           0.0, 0.0,
      _width - _xOffset,  -_yOffset,           1.0, 0.0,
      _width - _xOffset,  _height - _yOffset,  1.0, 1.0,
      -_xOffset,          _height - _yOffset,  0.0, 1.0
    ];
    this.indices = [ 0, 1, 2, 2, 3, 0 ];
    this._rebuild = false;
  }

}
