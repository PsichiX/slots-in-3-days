import Script from '../components/Script';
import System from '../systems/System';

export default class SpinButton extends Script {

  get enabled() {
    return this._enabled;
  }

  set enabled(value) {
    if (typeof value !== 'boolean') {
      throw new Error('`value` is not type of Boolean!');
    }

    this._enabled = value;
    this.entity.getComponent('Sprite').shader = value
      ? 'shaders/button-spin-enabled.json'
      : 'shaders/button-spin-disabled.json';
  }

  constructor() {
    super();

    this._enabled = true;
    this._onSpinButtonChange = this.onSpinButtonChange.bind(this);
  }

  onAttach() {
    super.onAttach();

    System.events.on('spin-button-change', this._onSpinButtonChange);
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
    System.events.trigger('spin');
  }

  onSpinButtonChange(state) {
    if (!state) {
      return;
    }

    for (const prop in state) {
      if (prop === 'enabled') {
        this.enabled = state[prop];
      }
    }
  }

}
