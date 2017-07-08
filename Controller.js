
const pug = require('pug');
const path = require('path');
const ActionTrigger = require('./ActionTrigger');
const Route = require('./Route');
const { appRoot } = require('./utils');

const pugCompileOptions = {
    cache: true,
    doctype: 'html'
}

const viewKey = Symbol('#view');
const rewriteControllerKey = Symbol('#rewriteControllerKey');

module.exports = class Controller {

    $beforeAction(){}
    $afterAction(){}

    constructor({ctx, route, router, view, rewriteController}){
        Object.defineProperties(this, {
            ctx: { value: ctx },
            route: { value: route },
            router: { value: router }
        });
        this[viewKey] = view;
        this[rewriteControllerKey] = rewriteController;
    }
    isRewrite(){
        return !!this[rewriteControllerKey];
    }
    get rewriteController(){
        return this[rewriteControllerKey];
    }
    get request(){
        return this.ctx.request;
    }
    get response(){
        return this.ctx.response;
    }
    get session(){
        return this.ctx.session;
    }
    set session(s){
        this.ctx.session = s;
    }
    get sessionId(){
        return this.ctx.sessionId;
    }
    get cookies(){
        return this.ctx.cookies;
    }
    get query(){
        return this.ctx.query;
    }
    throw(...arg){
        this.ctx.throw(...arg);
    }
    isAjax(){
        return this.ctx.headers['x-requested-with'] === 'XMLHttpRequest'
    }
    renderStream(stream){
        this.ctx.body = stream;
    }
    renderString(string){
        this.ctx.body = string;
    }
    render(model = {}, view){
        const controller = this.route.controller;
        view = view || this.route.action;

        const viewPath = view.startsWith('/') ? 
            path.join(appRoot, `${view}.pug`) : 
            path.join(this.route.viewsRoot, `${controller}/${view}.pug`);

        this.ctx.body = pug.compileFile(viewPath, pugCompileOptions)({
            model,
            view: this[viewKey]
        });
    }
    renderJSON(json = {}){
        this.ctx.body = json;
    }
    renderSVG(svg){
        this.ctx.body = svg;
        this.ctx.type="image/svg+xml";
    }
    redirect(params, area){
        const url = (typeof params === 'string') ? params : this.router.resolve(params, area);
        this.ctx.redirect(url);
    }
    async rewrite(params, area){
        const route = (typeof params === 'string') ? this.router.match(params) : new Route(params, area);
        const actionTrigger = new ActionTrigger({
            ctx: this.ctx,
            route,
            router: this.router
        });
        await actionTrigger.trigger(this);
    }
}