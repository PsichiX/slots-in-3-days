import System from './systems/System';
import EntitySystem from './systems/EntitySystem';
import AssetSystem from './systems/AssetSystem';
import RenderSystem from './systems/RenderSystem';
import SpinButton from './scripts/SpinButton';
import { hookAll } from './utils/hooks';
import { waitForSeconds } from './utils';
import { mat4 } from 'gl-matrix';

const entities = System.register(new EntitySystem());
const assets = System.register(new AssetSystem(
  'assets/',
  { cache: 'no-store' }
));
const renderer = System.register(new RenderSystem('screen-0'));

entities.registerComponent('SpinButton', () => new SpinButton());
hookAll({ entities, assets, renderer });

assets.loadSequence([
    'json://config/game.json',
    'scene://scenes/loading.json'
  ])
  .then(preload => assets.loadSequence(
    preload[0].data.preassets
  ))
  .then(setupLoadingScene)
  .then(() => waitForSeconds(1))
  .then(setupGameScene);


function setupLoadingScene() {
  entities.root = entities.buildEntity(
    assets.get('scene://scenes/loading.json').data
  );

  return assets.loadSequence(
    assets.get('json://config/game.json').data.assets
  );
};

function setupGameScene() {
  entities.root = entities.buildEntity(
    assets.get('scene://scenes/game.json').data
  );
};
