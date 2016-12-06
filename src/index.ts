'use strict';
import 'reflect-metadata';
import * as _ from 'lodash';

export function injectable(target: any) {
    // create a unique, global symbol name
  // -----------------------------------
  let injectableKey = Symbol.for('mlcl.di.injectables');

  // check if the global object has this symbol
  // add it if it does not have the symbol, yet
  // ------------------------------------------
  let globalSymbols = Object.getOwnPropertySymbols(global);
  let hasInjectableKey = (globalSymbols.indexOf(injectableKey) > -1);
  
  if (!hasInjectableKey) {
    if(!_.isObject(global[injectableKey])) {
      global[injectableKey] = {};
    }
    if(!_.isObject(global[injectableKey][target.name])) {
      global[injectableKey][target.name] = target;
    }
  }
}

export function inject() {

}

export function getInjectable(target: any) {
  let injectableKey = Symbol.for('mlcl.di.injectables');
  return global[injectableKey][target.name];
}

export function overrideInjectable(target: any ) {
    // create a unique, global symbol name
  // -----------------------------------
  let injectableKey = Symbol.for('mlcl.di.injectables');

  // check if the global object has this symbol
  // add it if it does not have the symbol, yet
  // ------------------------------------------
  let globalSymbols = Object.getOwnPropertySymbols(global);
  let hasInjectableKey = (globalSymbols.indexOf(injectableKey) > -1);
  global[injectableKey]['MySingletonClass'] = target;

  if (!hasInjectableKey) {
    if(!_.isObject(global[injectableKey])) {
      global[injectableKey] = {};
    }
    global[injectableKey]['MySingletonClass'] = target;
  }
}

export function singleton(target: any) {
  injectable(target);
  let injectableTarget = getInjectable(target);
  
  // create a unique, global symbol name
  // -----------------------------------
  let singletonKey = Symbol.for('mlcl.di.singletons');

  // check if the global object has this symbol
  // add it if it does not have the symbol, yet
  // ------------------------------------------
  let globalSymbols = Object.getOwnPropertySymbols(global);
  let hasSingletonKey = (globalSymbols.indexOf(singletonKey) > -1);

  if (!hasSingletonKey) {
    if(!_.isObject(global[singletonKey])) {
      global[singletonKey] = {};
    }
    if(!_.isObject(global[singletonKey][target.name])) {
      let singletonInstance = new injectableTarget();
      singletonInstance.test = 'hey';
      global[singletonKey][target.name] = singletonInstance;
    }
  }

  let targetModified = extend(injectableTarget, function(args) {
    console.log('target');
    console.log(global[singletonKey][target.name]);
    return global[singletonKey][target.name];
  });
  targetModified.test = 'huhu';
  overrideInjectable(targetModified);

  // ensure the API is never changed
  // -------------------------------
  Object.freeze(singleton);
}

function extend(sup, base) {
  let descriptor = Object.getOwnPropertyDescriptor(
    base.prototype,'constructor'
  );
  base.prototype = Object.create(sup.prototype);
  let handler = {
    construct: function(target, args) {
      let obj = Object.create(base.prototype);
      this.apply(target,obj,args);
      return obj;
    },
    apply: function(target, that, args) {
      // sup.apply(that,args);
      base.apply(that,args);
    }
  };
  let proxy = new Proxy(base,handler);
  descriptor.value = proxy;
  console.log(base.prototype);
  Object.defineProperty(base.prototype, 'constructor', descriptor);
  Object.defineProperty(proxy.prototype, 'name', {
    get: base.prototype.name
  });
  console.log('+++');
  console.log(proxy.prototype);
  console.log(proxy);
  return proxy;
}