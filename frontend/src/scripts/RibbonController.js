import Script from '../components/Script';
import System from '../systems/System';
import {
  tween,
  easeInOutCubic
} from '../utils/tween';

export default class RibbonController extends Script {

  get separation() {
    return this._separation;
  }

  set separation(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._separation = value;
  }

  constructor() {
    super();

    this._separation = 0;
    this._phase = 0;
    this._rebuild = true;
    this._onSpin = this.onSpin.bind(this);
  }

  onAttach() {
    super.onAttach();

    System.events.on(`spin-${this.entity.name}`, this._onSpin);
    this._rebuild = true;
  }

  onDetach() {
    super.onDetach();

    System.events.off(`spin-${this.entity.name}`, this._onSpin);
  }

  onUpdate(deltaTime) {
    if (!!this._rebuild) {
      this._rebuildRibbon();
    }

    const { entity, _separation, _phase } = this;
    const { childrenCount } = entity;

    if (childrenCount < 1) {
      return;
    }

    const startPos = (childrenCount - 1) * -0.5 * _separation;
    const size = childrenCount * _separation;

    for (let i = 0; i < childrenCount; ++i) {
      const child = entity.getChild(i);
      const unitPos = ((_phase + i) / childrenCount + 0.5) % 1;
      const pos = startPos + size * unitPos;

      child.setPosition(0, pos);
    }
  }

  onSpin(phase, time) {
    const { entity } = this;
    const { childrenCount } = entity;

    this._phase = ((this._phase / childrenCount) % 1) * childrenCount;
    const targetPhase = -phase + childrenCount * ((time + 3) | 0);

    tween(this, '_phase', targetPhase, time, easeInOutCubic);
  }

  _rebuildRibbon() {
    const { entity, _separation } = this;

    entity.killChildren();

    const assets = System.get('AssetSystem');
    const prefab = assets.get('scene://prefabs/symbol.json');
    const config = assets.get('json://config/game.json');

    if (!prefab) {
      throw new Error('There is no symbol prefab asset loaded!');
    }
    if (!config) {
      throw new Error('There is no game config asset loaded!');
    }

    this._rebuild = false;
    const { symbolMapping } = config.data;
    const { length } = symbolMapping;
    const { data } = prefab;

    for (let i = 0, c = length; i < c; ++i) {
      const node = entity.owner.buildEntity(data);
      const atlasSprite = node.getComponent('AtlasSprite');

      if (!atlasSprite) {
        throw new Error(
          'Entity created from prefab does not have AtlasSprite component!'
        );
      }

      const symbol = symbolMapping[i];

      node.name = `${i}`;
      node.parent = entity;
      atlasSprite.atlas = `atlases/spritesheet.json:${symbol}`;
    }
  }

}
