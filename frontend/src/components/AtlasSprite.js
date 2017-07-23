import Sprite from './Sprite';
import System from '../systems/System';

export default class AtlasSprite extends Sprite {

  get atlas() {
    return this._atlas;
  }

  set atlas(value) {
    if (typeof value !== 'string') {
      throw new Error('`value` is not type of String!');
    }

    const found = value.indexOf(':');
    if (found < 0) {
      throw new Error('`value` does not conform rule of "atlas:frame" naming!');
    }

    const original = value;
    const frame = value.substr(found + 1);
    value = value.substr(0, found);

    const assets = System.get('AssetSystem');
    if (!assets) {
      throw new Error('There is no registered AssetSystem!');
    }

    const atlas = assets.get(`atlas://${value}`);
    if (!atlas) {
      throw new Error(`There is no atlas asset loaded: ${value}`);
    }

    const { meta, frames } = atlas.data.descriptor;
    if (!meta || !frames) {
      throw new Error(`There is either no metadata or frames in atlas: ${value}`);
    }

    const { size } = meta;
    const info = frames[frame];
    if (!info || !info.frame) {
      throw new Error(`There is no frame information in atlas: ${value} (${frame})`);
    }

    const { x, y, w, h } = info.frame;

    this._atlas = original;
    this.overrideBaseTexture = meta.image;
    this.width = w;
    this.height = h;
    this.frameTopLeft = [
      x / size.w,
      y / size.h
    ];
    this.frameBottomRight = [
      (x + w) / size.w,
      (y + h) / size.h
    ];
  }

  constructor() {
    super();

    this._atlas = null;
  }

}
