import Component from '../systems/EntitySystem/Component';

export default class Script extends Component {

  onAction(name, ...args) {
    if (name === 'update') {
      return this.onUpdate(...args);
    } else if (name === 'render') {
      return this.onRender(...args);
    }
  }

  onUpdate(deltaTime) {}

  onRender(gl, renderer, deltaTime) {}

}
