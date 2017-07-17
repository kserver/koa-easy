const path = require('path');
const { appRoot, upperFirstLetter, camelCase } = require('./utils');

const paramsKey = Symbol();
const areaKey = Symbol();
const controllersRootKey = Symbol();
const viewRootKey = Symbol();
const controllerFileNameKey = Symbol();
const actionMethodNameKey = Symbol();

module.exports = class Route {
    constructor(params, area = ''){
        this[paramsKey] = params;
        this[areaKey] = area;

        this[controllerFileNameKey] = upperFirstLetter(camelCase(params.controller)) + 'Controller';
        this[actionMethodNameKey] = camelCase(`action-${params.action}`);

        let moduleRoot = appRoot;
        if(area){
            moduleRoot = path.resolve(moduleRoot, `areas/${area}`); 
        }
        this[controllersRootKey] = path.resolve(moduleRoot, 'controllers');
        this[viewRootKey] = path.resolve(moduleRoot, 'views');
    }
    get area(){
        return this[areaKey];
    }
    get controller(){
        return this[paramsKey].controller;
    }
    get action(){
        return this[paramsKey].action;
    }
    get params(){
        return this[paramsKey]
    }

    get controllerFileName(){
        return this[controllerFileNameKey];
    }
    get actionMethodName(){
        return this[actionMethodNameKey];
    }

    get controllersRoot(){
        return this[controllersRootKey];
    }

    get viewsRoot(){
        return this[viewRootKey];
    }
}