'use strict';

import { Flux, Store, Actions } from '../Flux';
import sinon from 'sinon';

describe('Flux', () => {

  describe('#createStore()', () => {
    it('throws if key already exists', () => {
      let flux = new Flux();

      flux.createStore('ExampleStore', Store);
      expect(flux.createStore.bind(flux, 'ExampleStore', Store)).to.throw(
        'You\'ve attempted to create multiple stores with key ExampleStore. '
      + 'Keys must be unique.'
      );
    });

    it('throws if Store is not a prototype of class', () => {
      let flux = new Flux();
      class ForgotToExtendStore {}

      expect(flux.createStore.bind(flux, 'Flux', ForgotToExtendStore)).to.throw(
        'You\'ve attempted to create a store from the class '
      + 'ForgotToExtendStore, which does not have the base Store class in its '
      + 'prototype chain. Make sure you\'re using the `extends` keyword: '
      + '`class ForgotToExtendStore extends Store { ... }`'
      );
    });

    it('registers store\'s handler with central dispatcher', () => {
      class ExampleStore extends Store {}

      let spy1 = sinon.spy();
      let spy2 = sinon.spy();

      ExampleStore.prototype.foo = 'bar';
      ExampleStore.prototype.handler = function(payload) {
        spy1(payload);
        spy2(this.foo);
      };

      let flux = new Flux();
      flux.createStore('ExampleStore', ExampleStore);
      let store = flux.getStore('ExampleStore');

      let payload = 'foobar';
      flux.dispatch('actionId', payload);
      expect(spy1.getCall(0).args[0].body).to.equal('foobar');
      expect(spy2.calledWith('bar')).to.be.true;
    });
  });

  describe('#getStore()', () => {
    it('retrieves store for key', () => {
      let flux = new Flux();

      flux.createStore('ExampleStore', Store);
      expect(flux.getStore('ExampleStore')).to.be.an.instanceOf(Store);
      expect(flux.getStore('NonexistentStore')).to.be.undefined;
    });
  });

  describe('#removeStore()', () => {
    it('removes store for key', () => {
      let flux = new Flux();

      flux.createStore('ExampleStore', Store);
      expect(flux.getStore('ExampleStore')).to.be.an.instanceOf(Store);
      flux.removeStore('ExampleStore');
      expect(flux.getStore('ExampleStore')).to.be.undefined;
    });
  });

  describe('#createActions()', () => {
    it('throws if key already exists', () => {
      let flux = new Flux();
      flux.createActions('ExampleActions', Actions);

      expect(flux.createActions.bind(flux, 'ExampleActions', Actions)).to.throw(
        'You\'ve attempted to create multiple actions with key ExampleActions. '
      + 'Keys must be unique.'
      );
    });

    it('throws if Store is not a prototype of class', () => {
      let flux = new Flux();
      class ForgotToExtendActions {}

      expect(flux.createActions.bind(flux, 'Flux', ForgotToExtendActions))
        .to.throw(
          'You\'ve attempted to create actions from the class '
        + 'ForgotToExtendActions, which does not have the base Actions class '
        + 'in its prototype chain. Make sure you\'re using the `extends` '
        + 'keyword: `class ForgotToExtendActions extends Actions { ... }`'
      );
    });
  });

  describe('#getActions()', () => {
    class TestActions extends Actions {}

    it('retrieves actions for key', () => {
      let flux = new Flux();
      flux.createActions('TestActions', Actions);

      expect(flux.getActions('TestActions')).to.be.an.instanceOf(Actions);
      expect(flux.getActions('NonexistentActions')).to.be.undefined;
    });

  });

  describe('#getActionIds() / #getConstants()', () => {
    class TestActions extends Actions {
      getFoo() {}
    }

    it('retrives ids of actions for key', () => {
      let flux = new Flux();
      flux.createActions('TestActions', TestActions);

      expect(typeof flux.getActionIds('TestActions').getFoo).to.equal('string');
      expect(flux.getActionIds('NonexistentActions')).to.be.undefined;

      expect(typeof flux.getConstants('TestActions').getFoo).to.equal('string');
      expect(flux.getConstants('NonexistentActions')).to.be.undefined;
    });
  });

  describe('#dispatch()', () => {

    it('delegates to dispatcher', () => {
      let flux = new Flux();
      let dispatch = sinon.spy();
      flux.dispatcher = { dispatch };
      let actionId = 'actionId';

      flux.dispatch(actionId, 'foobar');

      expect(dispatch.firstCall.args[0]).to.deep.equal({
        actionId,
        body: 'foobar',
      })
    });

  });

});
