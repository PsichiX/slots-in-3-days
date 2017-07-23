import Script from '../components/Script';
import Sprite from '../components/Sprite';

export default class CutRectangle extends Script {

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

    this._width = 0;
    this._height = 0;
    this._xOffset = 0;
    this._yOffset = 0;
    this._rebuild = true;
  }

  onUpdate(deltaTime) {
    if (!this._rebuild) {
      return;
    }

    this._rebuild = false;
    const sprite = this.entity.getComponent('Sprite');

    if (!sprite) {
      throw new Error('There is no Sprite component in this entity!');
    }

    const { width, height } = sprite;
    const { _width, _height, _xOffset, _yOffset } = this;

    sprite.overrideUniforms = {
      uRectTopLeft: [
        _xOffset / width,
        _yOffset / height
      ],
      uRectBottomRight: [
        (_xOffset + _width) / width,
        (_yOffset + _height) / height
      ]
    };
  }

}
