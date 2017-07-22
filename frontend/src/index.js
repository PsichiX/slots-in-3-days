import System from './systems/System';
import EntitySystem from './systems/EntitySystem';
import AssetSystem from './systems/AssetSystem';
import RenderSystem from './systems/RenderSystem';
import InputSystem from './systems/InputSystem';
import SpinButton from './scripts/SpinButton';
import { hookAll } from './utils/hooks';
import { waitForSeconds } from './utils';

const entities = System.register(new EntitySystem());
const assets = System.register(new AssetSystem('assets/', {
  cache: 'no-store'
}));
const renderer = System.register(new RenderSystem('screen-0'));
const input = System.register(new InputSystem(renderer.canvas));

entities.registerComponent('SpinButton', () => new SpinButton());
hookAll({ entities, assets, renderer });

setInterval(() => console.log(renderer.stats), 1000);

assets.loadSequence([
    'json://config/game.json',
    'scene://scenes/loading.json'
  ])
  .then(preload => assets.loadSequence(preload[0].data.preassets))
  .then(setupLoadingSceneAndLoadGame)
  .then(setupGameScene);


function setupLoadingSceneAndLoadGame() {
  entities.root = entities.buildEntity(
    assets.get('scene://scenes/loading.json').data
  );

  return Promise.all([
    assets.loadSequence(assets.get('json://config/game.json').data.assets),
    waitForSeconds(1)
  ]);
};

function setupGameScene() {
  entities.root = entities.buildEntity(
    assets.get('scene://scenes/game.json').data
  );
};
