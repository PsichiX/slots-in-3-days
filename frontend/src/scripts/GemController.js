import Script from '../components/Script';
import System from '../systems/System';
import { waitForSeconds } from '../utils';
import {
  tweenProgress,
  easeInOutCubic,
  easeOutElastic
} from '../utils/tween';

export default class GemController extends Script {

  constructor() {
    super();

    this._onSpin = this.onSpin.bind(this);
    this._onMatch = this.onMatch.bind(this);
    this._animating = false;
    this._matchMode = false;
  }

  onAttach() {
    super.onAttach();

    System.events.on('spin', this._onSpin);
    System.events.on('match', this._onMatch);
  }

  onDetach() {
    super.onDetach();

    System.events.off('spin', this._onSpin);
    System.events.off('match', this._onMatch);
  }

  onUpdate() {
    if (this._matchMode && !this._animating) {
      this._triggerAnimation();
    }
  }

  onSpin() {
    this._matchMode = false;
  }

  onMatch(phase) {
    if (this.entity.name !== `${phase}`) {
      return;
    }

    this._matchMode = true;
    this._triggerAnimation();
  }

  _triggerAnimation() {
    if (this._animating) {
      return;
    }

    this._animating = true;

    Promise.all([

      tweenProgress(
        this.entity,
        phase => this.entity.setRotation(phase * 2 * Math.PI),
        3,
        easeOutElastic
      ),

      tweenProgress(
        this.entity,
        phase => {
          const scale = 1 - 0.25 * phase;
          this.entity.setScale(scale, scale);
        },
        0.75,
        easeInOutCubic
      )
        .then(tweenProgress(
          this.entity,
          phase => {
            const scale = 0.75 + 0.25 * phase;
            this.entity.setScale(scale, scale);
          },
          3.25,
          easeOutElastic
        ))

    ])
      .then(() => waitForSeconds(2))
      .then(() => this._animating = false);
  }

}
