import RectangleRenderer from './RectangleRenderer';
import { vec2 } from 'gl-matrix';

export default class Sprite extends RectangleRenderer {

  get overrideBaseTexture() {
    const { overrideSamplers } = this;
    const sampler = overrideSamplers.get('sBase');

    return !!sampler
      ? sampler.texture
      : null;
  }

  set overrideBaseTexture(value) {
    const { overrideSamplers } = this;

    if (!value) {
      overrideSamplers.delete('sBase');
      return;
    }

    if (typeof value !== 'string') {
      throw new Error('`value` is not type of String!');
    }

    const sampler = overrideSamplers.get('sBase');

    if (!sampler) {
      overrideSamplers.set('sBase', {
        texture: value,
        filtering: 'linear'
      });
    } else {
      sampler.texture = value;
    }
  }

  get overrideBaseFiltering() {
    const { overrideSamplers } = this;
    const sampler = overrideSamplers.get('sBase');

    return !!sampler
      ? sampler.filtering
      : null;
  }

  set overrideBaseFiltering(value) {
    const { overrideSamplers } = this;

    if (typeof value !== 'string') {
      throw new Error('`value` is not type of String!');
    }

    const sampler = overrideSamplers.get('sBase');

    if (!sampler) {
      overrideSamplers.set('sBase', {
        texture: '',
        filtering: value
      });
    } else {
      sampler.filtering = value;
    }
  }

  get frameTopLeft() {
    return this._frameTopLeft;
  }

  set frameTopLeft(value) {
    if (!(value instanceof Array)) {
      throw new Error('`value` is not type of Array!');
    }
    if (value.length < 2) {
      throw new Error('`value` must have at lease 2 elements!');
    }

    vec2.copy(this._frameTopLeft, value);
    this._rebuild = true;
  }

  get frameBottomRight() {
    return this._frameBottomRight;
  }

  set frameBottomRight(value) {
    if (!(value instanceof Array)) {
      throw new Error('`value` is not type of Array!');
    }
    if (value.length < 2) {
      throw new Error('`value` must have at lease 2 elements!');
    }

    vec2.copy(this._frameBottomRight, value);
    this._rebuild = true;
  }

  constructor() {
    super();

    this._frameTopLeft = vec2.fromValues(0, 0);
    this._frameBottomRight = vec2.fromValues(1, 1);
  }

  ensureVertices() {
    if (!this._rebuild) {
      return;
    }

    const {
      _width,
      _height,
      _xOffset,
      _yOffset,
      _frameTopLeft,
      _frameBottomRight
    } = this;

    this.vertices = [
      -_xOffset,          -_yOffset,           _frameTopLeft[0],      _frameTopLeft[1],
      _width - _xOffset,  -_yOffset,           _frameBottomRight[0],  _frameTopLeft[1],
      _width - _xOffset,  _height - _yOffset,  _frameBottomRight[0],  _frameBottomRight[1],
      -_xOffset,          _height - _yOffset,  _frameTopLeft[0],      _frameBottomRight[1]
    ];
    this.indices = [ 0, 1, 2, 2, 3, 0 ];
    this._rebuild = false;
  }

}
