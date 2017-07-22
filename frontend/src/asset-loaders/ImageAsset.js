import Asset from '../systems/AssetSystem/Asset';

export default class ImageAsset extends Asset {

  static factory(...args) {
    return new ImageAsset(...args);
  }

  dispose() {
    delete this.data.src;

    super.dispose();
  }

  load() {
    const { filename, owner } = this;

    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        this.data = image;

        resolve(this);
      };
      image.onerror = error => reject(`Cannot load image file: ${filename}`);

      image.src = owner.pathPrefix + filename;
    });
  }

}
