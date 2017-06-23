module.exports = class View {
    constructor({ctx, route, router}){
        Object.defineProperties(this, {
            ctx: { value: ctx },
            route: { value: route },
            router: { value: router }
        });
    }
    url(params, area){
        return this.router.resolve(params, area);
    }
}