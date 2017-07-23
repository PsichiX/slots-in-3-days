import Script from '../components/Script';
import System from '../systems/System';
import { waitForSeconds } from '../utils';
import {
  tweenProgress,
  easeInOutCubic
} from '../utils/tween';

export default class SpinnerController extends Script {

  constructor() {
    super();

    this._animating = false;
  }

  onUpdate() {
    if (!this._animating) {
      this._triggerAnimation();
    }
  }

  _triggerAnimation() {
    if (this._animating) {
      return;
    }

    this._animating = true;

    tweenProgress(
      this.entity,
      phase => {
        this.entity.setRotation(-phase * 2 * Math.PI);
      },
      2,
      easeInOutCubic
    )
      .then(() => waitForSeconds(2))
      .then(() => this._animating = false);
  }

}
