import System from './systems/System';
import EntitySystem from './systems/EntitySystem';
import AssetSystem from './systems/AssetSystem';
import RenderSystem from './systems/RenderSystem';
import InputSystem from './systems/InputSystem';
import SpinButton from './scripts/SpinButton';
import CutRectangle from './scripts/CutRectangle';
import GameController from './scripts/GameController';
import RibbonController from './scripts/RibbonController';
import GemController from './scripts/GemController';
import ScreenShake from './scripts/ScreenShake';
import WelcomeController from './scripts/WelcomeController';
import SpinnerController from './scripts/SpinnerController';
import { hookAll } from './utils/hooks';
import { waitForSeconds } from './utils';

const entities = System.register(new EntitySystem());
const assets = System.register(new AssetSystem('assets/', {
  cache: 'no-store'
}));
const renderer = System.register(new RenderSystem('screen-0'));
const input = System.register(new InputSystem(renderer.canvas));

// register user scripts
entities.registerComponent('SpinButton', () => new SpinButton());
entities.registerComponent('CutRectangle', () => new CutRectangle());
entities.registerComponent('GameController', () => new GameController());
entities.registerComponent('RibbonController', () => new RibbonController());
entities.registerComponent('GemController', () => new GemController());
entities.registerComponent('ScreenShake', () => new ScreenShake());
entities.registerComponent('WelcomeController', () => new WelcomeController());
entities.registerComponent('SpinnerController', () => new SpinnerController());

hookAll({ entities, assets, renderer });

window.openInFullscreen = () => {
  const { canvas } = renderer;
  const requestFullscreen =
    canvas.requestFullscreen ||
    canvas.webkitRequestFullscreen ||
    canvas.mozRequestFullscreen;

  if (!!requestFullscreen) {
    requestFullscreen.call(canvas);
  }
};

assets.loadSequence([
    'json://config/game.json'
  ])
  .then(preload => assets.loadSequence(preload[0].data.assets))
  .then(() => System.events.trigger(
    'change-scene',
    'scene://scenes/welcome.json'
  ));
