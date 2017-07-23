import Component from '../systems/EntitySystem/Component';
import System from '../systems/System';

const EventFlags = {
  NONE: 0,
  MOUSE_DOWN: 1 << 0,
  MOUSE_UP: 1 << 1,
  MOUSE_MOVE: 1 << 2,
  MOUSE: 0x7,
  ALL: 0xF
};

export default class Script extends Component {

  static get EventFlags() {
    return EventFlags;
  }

  get listenTo() {
    return this._listenTo;
  }

  set listenTo(value) {
    if (typeof value !== 'number') {
      throw new Error('`value` is not type of Number!');
    }

    const input = System.get('InputSystem');

    if (!input) {
      throw new Error('There is no registered InputSystem!');
    }

    const last = this._listenTo;
    const listenTo = this._listenTo = value | 0;
    const change = last ^ listenTo;

    if (change & EventFlags.MOUSE_DOWN) {
      if (listenTo & EventFlags.MOUSE_DOWN) {
        input.events.on('mouse-down', this._onMouseDown);
      } else {
        input.events.off('mouse-down', this._onMouseDown);
      }
    }

    if (change & EventFlags.MOUSE_UP) {
      if (listenTo & EventFlags.MOUSE_UP) {
        input.events.on('mouse-up', this._onMouseUp);
      } else {
        input.events.off('mouse-up', this._onMouseUp);
      }
    }

    if (change & EventFlags.MOUSE_DMOVE) {
      if (listenTo & EventFlags.MOUSE_MOVE) {
        input.events.on('mouse-move', this._onMouseMove);
      } else {
        input.events.off('mouse-move', this._onMouseMove);
      }
    }
  }

  constructor() {
    super();

    this._listenTo = EventFlags.NONE;
    // prior to make it possible to remove events we have to bind them locally.
    this._onMouseDown = this.onMouseDown.bind(this);
    this._onMouseUp = this.onMouseUp.bind(this);
    this._onMouseMove = this.onMouseMove.bind(this);
  }

  dispose() {
    super.dispose();

    this.listenTo = EventFlags.NONE;
  }

  onAction(name, ...args) {
    if (name === 'update') {
      return this.onUpdate(...args);
    } else if (name === 'render') {
      return this.onRender(...args);
    }
  }

  onPropertySetup(name, value) {
    if (name === 'listenTo') {
      if (!(value instanceof Array)) {
        throw new Error('`value` is not type of Array!');
      }

      let flags = EventFlags.NONE;
      for (let i = 0, c = value.length; i < c; ++i) {
        const flag = value[i];

        if (flag === 'mouse-down') {
          flags |= EventFlags.MOUSE_DOWN;
        } else if (flag === 'mouse-up') {
          flags |= EventFlags.MOUSE_UP;
        } else if (flag === 'mouse-move') {
          flags |= EventFlags.MOUSE_MOVE;
        } else if (flag === 'all') {
          flags |= EventFlags.ALL;
        }
      }

      this.listenTo = flags;
    } else {
      super.onPropertySetup(name, value);
    }
  }

  onUpdate(deltaTime) {}

  onRender(gl, renderer, deltaTime) {}

  onMouseDown(unitVec, screenVec) {}

  onMouseUp(unitVec, screenVec) {}

  onMouseMove(unitVec, screenVec) {}

}
