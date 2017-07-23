import Script from '../components/Script';
import System from '../systems/System';
import { waitForSeconds } from '../utils';
import {
  tweenProgress,
  easeOutElastic
} from '../utils/tween';

export default class WelcomeController extends Script {

  onAction(name, ...args) {
    if (name === 'click') {
      this.onClick(...args);
    } else {
      super.onAction(name, ...args);
    }
  }

  onClick(localVec) {
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
