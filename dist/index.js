'use strict';
require("reflect-metadata");
const _ = require("lodash");
function injectable(target) {
    let injectableKey = Symbol.for('mlcl.di.injectables');
    let globalSymbols = Object.getOwnPropertySymbols(global);
    let hasInjectableKey = (globalSymbols.indexOf(injectableKey) > -1);
    if (!hasInjectableKey) {
        if (!_.isObject(global[injectableKey])) {
            global[injectableKey] = {};
        }
        if (!_.isObject(global[injectableKey][target.name])) {
            global[injectableKey][target.name] = target;
        }
    }
}
exports.injectable = injectable;
function inject() {
}
exports.inject = inject;
function getInjectable(target) {
    let injectableKey = Symbol.for('mlcl.di.injectables');
    return global[injectableKey][target.name];
}
exports.getInjectable = getInjectable;
function overrideInjectable(target) {
    let injectableKey = Symbol.for('mlcl.di.injectables');
    let globalSymbols = Object.getOwnPropertySymbols(global);
    let hasInjectableKey = (globalSymbols.indexOf(injectableKey) > -1);
    global[injectableKey]['MySingletonClass'] = target;
    if (!hasInjectableKey) {
        if (!_.isObject(global[injectableKey])) {
            global[injectableKey] = {};
        }
        global[injectableKey]['MySingletonClass'] = target;
    }
}
exports.overrideInjectable = overrideInjectable;
function singleton(target) {
    injectable(target);
    let injectableTarget = getInjectable(target);
    let singletonKey = Symbol.for('mlcl.di.singletons');
    let globalSymbols = Object.getOwnPropertySymbols(global);
    let hasSingletonKey = (globalSymbols.indexOf(singletonKey) > -1);
    if (!hasSingletonKey) {
        if (!_.isObject(global[singletonKey])) {
            global[singletonKey] = {};
        }
        if (!_.isObject(global[singletonKey][target.name])) {
            let singletonInstance = new injectableTarget();
            singletonInstance.test = 'hey';
            global[singletonKey][target.name] = singletonInstance;
        }
    }
    let targetModified = extend(injectableTarget, function (args) {
        console.log('target');
        console.log(global[singletonKey][target.name]);
        return global[singletonKey][target.name];
    });
    targetModified.test = 'huhu';
    overrideInjectable(targetModified);
    Object.freeze(singleton);
}
exports.singleton = singleton;
function extend(sup, base) {
    let descriptor = Object.getOwnPropertyDescriptor(base.prototype, 'constructor');
    base.prototype = Object.create(sup.prototype);
    let handler = {
        construct: function (target, args) {
            let obj = Object.create(base.prototype);
            this.apply(target, obj, args);
            return obj;
        },
        apply: function (target, that, args) {
            base.apply(that, args);
        }
    };
    let proxy = new Proxy(base, handler);
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

//# sourceMappingURL=index.js.map
