import EntitySystem from '../systems/EntitySystem';
import AssetSystem from '../systems/AssetSystem';
import RenderSystem from '../systems/RenderSystem';
import JSONAsset from '../asset-loaders/JSONAsset';
import TextAsset from '../asset-loaders/TextAsset';
import ImageAsset from '../asset-loaders/ImageAsset';
import ShaderAsset from '../asset-loaders/ShaderAsset';
import SceneAsset from '../asset-loaders/SceneAsset';
import AtlasAsset from '../asset-loaders/AtlasAsset';
import Camera2D from '../components/Camera2D';
import InputListener from '../components/InputListener';
import RectangleRenderer from '../components/RectangleRenderer';
import Script from '../components/Script';
import Sprite from '../components/Sprite';
import AtlasSprite from '../components/AtlasSprite';
import VerticesRenderer from '../components/VerticesRenderer';
import System from '../systems/System';

export function registerAllKnownScripts(entities) {
  if (!(entities instanceof EntitySystem)) {
    throw new Error('`entities` is not type of EntitySystem!');
  }

  entities.registerComponent('Camera2D', () => new Camera2D());
  entities.registerComponent('InputListener', () => new InputListener());
  entities.registerComponent('RectangleRenderer', () => new RectangleRenderer());
  entities.registerComponent('Script', () => new Script());
  entities.registerComponent('Sprite', () => new Sprite());
  entities.registerComponent('AtlasSprite', () => new AtlasSprite());
  entities.registerComponent('VerticesRenderer', () => new VerticesRenderer());
}

export function registerAllKnownAssetLoaders(assets) {
  if (!(assets instanceof AssetSystem)) {
    throw new Error('`assets` is not type of AssetSystem!');
  }

  assets.registerProtocol('json', JSONAsset.factory);
  assets.registerProtocol('text', TextAsset.factory);
  assets.registerProtocol('image', ImageAsset.factory);
  assets.registerProtocol('shader', ShaderAsset.factory);
  assets.registerProtocol('scene', SceneAsset.factory);
  assets.registerProtocol('atlas', AtlasAsset.factory);
}

export function hookRendererIntoAssetsLoadingPipeline(assets, renderer) {
  if (!(assets instanceof AssetSystem)) {
    throw new Error('`assets` is not type of AssetSystem!');
  }
  if (!(renderer instanceof RenderSystem)) {
    throw new Error('`renderer` is not type of RenderSystem!');
  }

  assets.events.on('load', asset => {
    const { protocol, filename, data } = asset;

    if (protocol === 'image') {
      renderer.registerTexture(filename, data);
    } else if (protocol === 'shader') {
      renderer.registerShader(
        filename,
        data.vertex,
        data.fragment,
        data.layout,
        data.uniforms,
        data.samplers,
        data.blending
      );
    }
  });

  assets.events.on('unload', asset => {
    const { protocol, filename } = asset;

    if (protocol === 'image') {
      renderer.unregisterTexture(filename);
    } else if (protocol === 'shader') {
      renderer.unregisterShader(filename);
    }
  });
}

export function hookSystemsIntoLifeCycle(entities, renderer, assets) {
  if (!(entities instanceof EntitySystem)) {
    throw new Error('`entities` is not type of EntitySystem!');
  }
  if (!(renderer instanceof RenderSystem)) {
    throw new Error('`renderer` is not type of RenderSystem!');
  }

  renderer.events.on('render', (context, renderer, deltaTime) => {
    entities.updateTransforms();
    entities.performAction('update', deltaTime);
    entities.performAction('render', context, renderer, deltaTime);

    System.events.trigger('tween-update');
  });

  System.events.on('change-scene', path => setTimeout(() => {
    const asset = assets.get(path);
    if (!asset) {
      throw new Error(`There is no asset loaded: ${path}`);
    }
    if (!(asset instanceof SceneAsset)) {
      throw new Error(`Asset is not type of SceneAsset: ${path}`);
    }

    entities.root = entities.buildEntity(asset.data);
  }, 0));
}

export function hookAll({ entities, assets, renderer }) {
  if (!(entities instanceof EntitySystem)) {
    throw new Error('`entities` is not type of EntitySystem!');
  }
  if (!(assets instanceof AssetSystem)) {
    throw new Error('`assets` is not type of AssetSystem!');
  }
  if (!(renderer instanceof RenderSystem)) {
    throw new Error('`renderer` is not type of RenderSystem!');
  }

  registerAllKnownScripts(entities);
  registerAllKnownAssetLoaders(assets);
  hookRendererIntoAssetsLoadingPipeline(assets, renderer);
  hookSystemsIntoLifeCycle(entities, renderer, assets);
}
