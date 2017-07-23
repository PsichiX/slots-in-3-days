import Script from '../components/Script';
import System from '../systems/System';
import {
  tweenProgress,
  easeOutElastic
} from '../utils/tween';

export default class SpinButton extends Script {

  get enabled() {
    return this._enabled;
  }

  set enabled(value) {
    if (typeof value !== 'boolean') {
      throw new Error('`value` is not type of Boolean!');
    }

    this._enabled = value;

    const { entity } = this;
    if (!entity) {
      return;
    }

    const sprite = entity.getComponent('AtlasSprite');
    if(!sprite) {
      throw new Error('There is no AtlasSprite component in this entity!');
    }

    sprite.atlas = value
      ? 'atlases/spritesheet.json:BTN_Spin.png'
      : 'atlases/spritesheet.json:BTN_Spin_d.png';
  }

  constructor() {
    super();

    this._enabled = true;
    this._onSpinButtonChange = this.onSpinButtonChange.bind(this);
  }

  onAttach() {
    super.onAttach();

    System.events.on('spin-button-change', this._onSpinButtonChange);
    this.enabled = this.enabled;
  }

  onDetach() {
    super.onDetach();

    System.events.off('spin-button-change', this._onSpinButtonChange);
  }

  onAction(name, ...args) {
    if (name === 'click') {
      this.onClick(...args);
    } else {
      super.onAction(name, ...args);
    }
  }

  onClick(localVec) {
    if (this._enabled) {
      System.events.trigger('spin');

      tweenProgress(
        this.entity,
        phase => {
          this.entity.setRotation(phase * 2 * Math.PI);
        },
        2,
        easeOutElastic
      )
    }
  }

  onSpinButtonChange(state) {
    this.enabled = state;
  }

}
