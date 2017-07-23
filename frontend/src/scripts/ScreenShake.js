import Script from '../components/Script';
import System from '../systems/System';
import { waitForSeconds } from '../utils';
import {
  tweenProgress,
  easeLinear
} from '../utils/tween';

export default class ScreenShake extends Script {

  get size() {
    return this._size;
  }

  set size(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._size = value;
  }

  get zoom() {
    return this._zoom;
  }

  set zoom(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._zoom = value;
  }

  get angle() {
    return this._angle;
  }

  set angle(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    this._angle = value;
  }

  constructor() {
    super();

    this._size = 1;
    this._zoom = 1;
    this._angle = 1;
    this._onShake = this.onShake.bind(this);
  }

  onAttach() {
    super.onAttach();

    System.events.on('shake', this._onShake);
  }

  onDetach() {
    super.onDetach();

    System.events.off('shake', this._onShake);
  }

  onShake(time) {
    if (!!navigator.vibrate) {
      navigator.vibrate(time * 1000);
    }

    tweenProgress(
      this.entity,
      phase => {
        phase = Math.sin(phase * Math.PI);
        const factor = phase * this._size;
        const { entity } = this;
        const scale = 1.0 + this._zoom * phase;
        const rot = phase * this._angle * Math.PI / 180;

        entity.setPosition(
          ((Math.random() % 1) - 0.5) * factor,
          ((Math.random() % 1) - 0.5) * factor
        );
        entity.setScale(scale, scale);
        entity.setRotation(
          ((Math.random() % 1) - 0.5) * rot
        );
      },
      time,
      easeLinear
    );
  }

}
