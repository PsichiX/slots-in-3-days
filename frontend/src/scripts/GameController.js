import Script from '../components/Script';
import System from '../systems/System';
import { waitForSeconds } from '../utils';

export default class GameController extends Script {

  constructor() {
    super();

    this._onSpin = this.onSpin.bind(this);
    this._cachedWidth = 0;
    this._cachedHeight = 0;
    this._overlay = null;
  }

  onAttach() {
    super.onAttach();

    System.events.on('spin', this._onSpin);

    const assets = System.get('AssetSystem');
    if (!assets) {
      throw new Error('There is no registered AssetSystem!');
    }

    const asset = assets.get('scene://prefabs/overlay.json');
    if (!asset) {
      throw new Error('There is no loaded overlay prefab asset!');
    }

    this._overlay = this.entity.owner.buildEntity(asset.data);
  }

  onDetach() {
    super.onDetach();

    System.events.off('spin', this._onSpin);
  }

  onUpdate() {
    const renderer = System.get('RenderSystem');
    if (!renderer) {
      throw new Error('There is no registered RenderSystem!');
    }

    const { canvas } = renderer;
    const { width, height } = canvas;
    const { _cachedWidth, _cachedHeight, _overlay, entity } = this;

    if (!_overlay) {
      throw new Error('There is no created overlay entity!');
    }

    if (width !== _cachedWidth || height !== _cachedHeight) {
      _overlay.parent = canvas.width < canvas.height
        ? entity
        : null;
    }
  }

  onSpin() {
    const { events } = System;
    const time = 2;

    /*const r0 = (Math.random() * 6) | 0;
    const r1 = (Math.random() * 6) | 0;
    const r2 = (Math.random() * 6) | 0;*/
    const r = (Math.random() * 6) | 0;
    const r0 = r;
    const r1 = r;
    const r2 = r;

    events.trigger('spin-button-change', false);
    events.trigger('spin-0', r0, time);
    events.trigger('spin-1', r1, time);
    events.trigger('spin-2', r2, time);
    events.trigger('shake', time);

    waitForSeconds(time + 0.05)
      .then(() => events.trigger('spin-button-change', true))
      .then(() => {
        if (r0 === r1 && r0 === r2) {
          events.trigger('match', r0);
        }
      });
  }

}
