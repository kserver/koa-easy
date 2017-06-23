const Router = require('./Router');
const ActionTrigger = require('./ActionTrigger');
const NotFoundError = require('./NotFoundError');
const BaseView = require('./View');

const Decorator = require('./reflect/Decorator');
const paramFrom = require('./decorators/paramFrom');
const params = require('./decorators/params');
Decorator.register('query', paramFrom('query'));
Decorator.register('post', paramFrom('post'));
Decorator.register('params', params);

module.exports = function(routerConfig, CustomView=BaseView, decorator){
    const View = (CustomView.prototype instanceof BaseView) ? CustomView : BaseView;

    const router = new Router(routerConfig);

    return async (ctx, next) => {
        const route = router.match(ctx.path);

        if(!route){
            ctx.throw(404);
            return;
        }

        const actionTrigger = new ActionTrigger({
            ctx, route, router, decorator,
            view: new View({ctx, route, router})
        });
        try{
            await actionTrigger.trigger();
        }catch(e){
            if(e instanceof NotFoundError) ctx.throw(404)
            //nodejs fs can't read file
            else if(e.code==='ENOENT') ctx.throw(500, 'koa-mvc controller.render can\'t found pug view file!')
            else throw e;
        }
    }
}