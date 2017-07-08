const path = require('path');
const Controller = require('./Controller');
const reflectInit = require('./reflect/init');
const NotFoundError = require('./NotFoundError');
const Metadata = require('./reflect/Metadata');

const cache = {};

function findControllerByPath(p, decorator){
    if(!cache[p]){
        try{
            cache[p] = require(p);
            reflectInit(cache[p], decorator);
        }catch(e){
            if(e.message.startsWith('Cannot find module ')){
                cache[p] = new NotFoundError('controller not found');
            }
            cache[p] = e;
        }
    }

    const RouteController = cache[p];
    if(RouteController instanceof Error) throw RouteController;
    if(! RouteController.prototype instanceof Controller)
        throw new Error('required controller class is not drive from koa-mvc/Controller');
    return RouteController;
}

module.exports = class ActionTrigger{
    constructor({ctx, route, router, decorator, view}){
        this._ctx = ctx;
        this._route = route;
        this._router = router;
        this._view = view;

        this._decorator = decorator;

        this._controllerName = route.controllerFileName;
        this._actionName = route.actionMethodName;
    }
    build(rewriteController){
        const RouteController = findControllerByPath(path.resolve(
            this._route.controllersRoot,
            this._controllerName
        ), this._decorator);

        this._controller = new RouteController({
            ctx: this._ctx,
            route: this._route,
            router: this._router,
            view: this._view,
            rewriteController
        });
    }
    async trigger(rewriteController){
        if(!this._controller) this.build(rewriteController);

        const controller = this._controller;
        if(Reflect.getPrototypeOf(controller).hasOwnProperty(this._actionName)){
            const meta = Metadata.getMetadata(controller.constructor, this._actionName);
            let result = await controller.$beforeAction();

            if(result!==false){
                const args = (meta.$$params||[]).map(key=>{
                    let searchParamFrom = ['query', 'body'];
                    if(meta.$$paramFrom&&meta.$$paramFrom[key]){
                        searchParamFrom = meta.$$paramFrom[key]; 
                    }
                    for(let from of searchParamFrom){
                        switch(from){
                            case 'query':
                                if(key in controller.query)
                                    return controller.query[key];
                                break;
                            case 'body':
                                if(key in controller.request.body)
                                    return controller.request.body[key];
                                break;
                        }
                    }

                    return undefined;
                });
                const actionResult = await controller[this._actionName](...args);
            }
            await controller.$afterAction(); 
            
        } else throw new NotFoundError('action not found');
    }
}