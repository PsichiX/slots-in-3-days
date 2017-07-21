import System from './systems/System';
import EntitySystem from './systems/EntitySystem';
import AssetSystem from './systems/AssetSystem';
import RenderSystem from './systems/RenderSystem';
import JSONAsset from './asset-loaders/JSONAsset';
import TextAsset from './asset-loaders/TextAsset';
import ImageAsset from './asset-loaders/ImageAsset';
import ShaderAsset from './asset-loaders/ShaderAsset';

const entities = System.register(new EntitySystem());
const assets = System.register(new AssetSystem('assets/'));
const renderer = System.register(new RenderSystem('screen-0'));

assets.registerProtocol('json', JSONAsset.factory);
assets.registerProtocol('text', TextAsset.factory);
assets.registerProtocol('image', ImageAsset.factory);
assets.registerProtocol('shader', ShaderAsset.factory);

assets.loadSequence([
  'json://config/symbols.json',
  'image://images/BG.png',
  'shader://shaders/default.shader'
]).then(data => console.log(data));
