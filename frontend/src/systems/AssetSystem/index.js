import System from '../System';
import Asset from './Asset';

const _pathRegex = /(\w+)(\:\/\/)([\w\.\/\-_]+)/;

export default class AssetSystem extends System {

  get pathPrefix() {
    return this._pathPrefix;
  }

  constructor(pathPrefix) {
    super();

    if (!!pathPrefix && typeof pathPrefix !== 'string') {
      throw new Error('`pathPrefix` is not type of String!');
    }

    this._pathPrefix = pathPrefix || '';
    this._assets = new Map();
    this._loaders = new Map();
  }

  dispose() {
    const { _assets, _loaders } = this;

    for (const asset of _assets.values()) {
      asset.dispose();
    }
    for (const loader of _loaders.values()) {
      loader.dispose();
    }

    _assets.clear();
    _loaders.clear();
  }

  registerProtocol(protocol, assetConstructor) {
    if (typeof protocol !== 'string') {
      throw new Error('`protocol` is not type of String!');
    }
    if (!(assetConstructor instanceof Function)) {
      throw new Error('`assetConstructor` is not type of Function!');
    }

    const { _loaders } = this;

    if (_loaders.has(protocol)) {
      throw new Error(`There is already registered protocol: ${protocol}`);
    }

    _loaders.set(protocol, assetConstructor);
  }

  unregisterProtocol(protocol) {
    if (typeof protocol !== 'string') {
      throw new Error('`protocol` is not type of String!');
    }
    if (!this._loaders.delete(protocol)) {
      throw new Error(`There is no registered protocol: ${protocol}`);
    }
  }

  get(path) {
    if (typeof path !== 'string') {
      throw new Error('`path` is not type of String!');
    }

    return this._assets.get(path);
  }

  load(path) {
    if (typeof path !== 'string') {
      throw new Error('`path` is not type of String!');
    }

    const result = _pathRegex.exec(path);
    if (!result) {
      throw new Error(`\`path\` does not conform asset path name rules: ${path}`);
    }

    const [ , protocol,, filename ] = result;
    const loader = this._loaders.get(protocol);
    if (!loader) {
      throw new Error(`There is no registered protocol: ${protocol}`);
    }

    const { _assets } = this;
    if (_assets.has(path)) {
      throw new Error(`There is already created asset for path: ${path}`);
    }

    const asset = loader(this, protocol, filename);
    if (!(asset instanceof Asset)) {
      throw new Error(
        `Cannot create asset for file: ${filename} of protocol: ${protocol}`
      );
    }

    return asset.load().then(data => {
      this._assets.set(path, asset);
      return data;
    });
  }

  async loadSequence(paths) {
    if (!(paths instanceof Array)) {
      throw new Error('`paths` is not type of Array!');
    }

    const result = [];
    for (let i = 0, c = paths.length; i < c; ++i) {
      result.push(await this.load(paths[i]));
    }

    return result;
  }

  async loadAll(paths) {
    if (!(paths instanceof Array)) {
      throw new Error('`paths` is not type of Array!');
    }

    return Promise.all(paths.map(path => this.load(path)));
  }

  unload(path) {
    const { _assets } = this;
    const asset = _assets.get(path);

    if (!asset) {
      throw new Error(`Trying to unload non-existing asset: ${path}`);
    }

    asset.dispose();
    _assets.delete(path);
  }

  onRegister() {}

  onUnregister() {
    dispose();
  }

}
