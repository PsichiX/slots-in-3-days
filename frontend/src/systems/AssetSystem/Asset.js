import AssetSystem from '.';

export default class Asset {

  get owner() {
    return this._owner;
  }

  get protocol() {
    return this._protocol;
  }

  get filename() {
    return this._filename;
  }

  get data() {
    return this._data;
  }

  set data(data) {
    this._data = data;
  }

  constructor(owner, protocol, filename) {
    if (!(owner instanceof AssetSystem)) {
      throw new Error('`owner` is not type of AssetSystem!');
    }
    if (typeof protocol !== 'string') {
      throw new Error('`protocol` is not type of String!');
    }
    if (typeof filename !== 'string') {
      throw new Error('`filename` is not type of String!');
    }

    this._owner = owner;
    this._protocol = protocol;
    this._filename = filename;
    this._data = null;
  }

  dispose() {
    this._data = null;
  }

  load() {
    return Promise.reject(new Error('Cannot load generic empty asset!'));
  }

  onReady() {}

}
