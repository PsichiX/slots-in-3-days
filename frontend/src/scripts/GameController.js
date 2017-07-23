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
    this._config = null;
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

    const config = assets.get('json://config/game.json');
    if (!config) {
      throw new Error('There is no loaded game config asset!');
    }

    this._config = config.data;
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
    let r0, r1, r2;

    events.trigger('spin-button-change', false);

    this._requestSymbol()
      .then(response => {
        const symbol = response.data;
        const { symbolMapping } = this._config;
        const { length } = symbolMapping;
        const found = symbolMapping.indexOf(symbol);

        if (symbol === '_random_') {
          r0 = r1 = r2 = (Math.random() * length) | 0;
        } else if (symbol === '' || found < 0) {
          r0 = (Math.random() * length) | 0;
          r1 = (Math.random() * length) | 0;
          r2 = (Math.random() * length) | 0;
        } else {
          r0 = r1 = r2 = found;
        }

        events.trigger('spin-0', r0, time);
        events.trigger('spin-1', r1, time);
        events.trigger('spin-2', r2, time);
        events.trigger('shake', time);
      })
      .then(() => waitForSeconds(time))
      .then(() => {
        if (r0 === r1 && r0 === r2) {
          events.trigger('match', r0);
        }
      })
      .then(() => waitForSeconds(0.125))
      .then(() => events.trigger('spin-button-change', true));
  }

  _requestSymbol() {
    return fetch(this._config.apiRequestSymbol, {
      cache: 'no-store',
      mode: 'no-cors'
    })
      .then(response => {
        return !!response.ok
          ? response.json()
          : { data: { symbol: '' } };
      })
      .catch(() => Promise.resolve({ data: { symbol: '' } }));
  }

}
