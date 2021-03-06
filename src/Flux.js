/**
 * Flux
 *
 * The main Flux class.
 */

'use strict';

import Store from './Store';
import Actions from './Actions';
import { Dispatcher } from 'flux';
import EventEmitter from 'eventemitter3';

export default class Flux extends EventEmitter {

  constructor() {
    this.dispatcher = new Dispatcher();
    this._stores = new Map();
    this._actions = new Map();

    this.getConstants = this.getActionIds;
  }

  createStore(key, _Store, ...constructorArgs) {

    if (!(_Store.prototype instanceof Store) && _Store !== Store) {
      let className = _Store.prototype.constructor.name;

      throw new Error(
        `You've attempted to create a store from the class ${className}, which `
      + `does not have the base Store class in its prototype chain. Make sure `
      + `you're using the \`extends\` keyword: \`class ${className} extends `
      + `Store { ... }\``
      );
    }

    if (this._stores.has(key)) {
      throw new Error(
        `You've attempted to create multiple stores with key ${key}. Keys must `
      + `be unique.`
      );
    }

    let store = new _Store(...constructorArgs);
    let token = this.dispatcher.register(store.handler.bind(store));

    store._waitFor = this.waitFor.bind(this);
    store._token = token;

    this._stores.set(key, store);
  }

  getStore(key) {
    return this._stores.get(key);
  }

  removeStore(key) {
    this._stores.delete(key);
  }

  createActions(key, _Actions, ...constructorArgs) {

    if (!(_Actions.prototype instanceof Actions) && _Actions !== Actions) {
      let className = _Actions.prototype.constructor.name;

      throw new Error(
        `You've attempted to create actions from the class ${className}, which `
      + `does not have the base Actions class in its prototype chain. Make `
      + `sure you're using the \`extends\` keyword: \`class ${className} `
      + `extends Actions { ... }\``
      );
    }

    if (this._actions.has(key)) {
      throw new Error(
        `You've attempted to create multiple actions with key ${key}. Keys `
      + `must be unique.`
      );
    }

    let actions = new _Actions(...constructorArgs);
    actions.dispatch = this.dispatch.bind(this);

    this._actions.set(key, actions);
  }

  getActions(key) {
    return this._actions.get(key);
  }

  getActionIds(key) {
    let actions = this.getActions(key);

    if (!actions) return;

    return actions.getConstants();
  }

  dispatch(actionId, body) {
    this.dispatcher.dispatch({ actionId, body });
  }

  waitFor(tokensOrStores) {

    if (!Array.isArray(tokensOrStores)) tokensOrStores = [tokensOrStores];

    let ensureIsToken = tokenOrStore => {
      return tokenOrStore instanceof Store
        ? tokenOrStore._token
        : tokenOrStore;
    };

    let tokens = tokensOrStores.map(ensureIsToken);

    this.dispatcher.waitFor(tokens);
  }

}

let Flummox = Flux;

export {
  Flux,
  Flummox,
  Store,
  Actions,
};
