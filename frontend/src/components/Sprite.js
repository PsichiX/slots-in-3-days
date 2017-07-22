import RectangleRenderer from './RectangleRenderer';

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
