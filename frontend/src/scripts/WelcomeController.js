import Script from '../components/Script';
import System from '../systems/System';
import { waitForSeconds } from '../utils';
import {
  tweenProgress,
  easeOutElastic
} from '../utils/tween';

export default class WelcomeController extends Script {

  constructor() {
    super();

    this._canAnimate = true;
  }

  onAction(name, ...args) {
    if (name === 'click') {
      this.onClick(...args);
    } else {
      super.onAction(name, ...args);
    }
  }

  onClick(localVec) {
    if (!this._canAnimate) {
      return;
    }

    this._canAnimate = false;

    tweenProgress(
      this.entity,
      phase => {
        this.entity.setRotation(phase * 2 * Math.PI);
      },
      2,
      easeOutElastic
    )
      .then(waitForSeconds(0.5))
      .then(() => System.events.trigger(
        'change-scene',
        'scene://scenes/game.json'
      ));
  }

}
