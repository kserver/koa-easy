const Controller = require('../../../../Controller');

module.exports = class ListController extends Controller {
    // @POST
    query(){ // http post /api/list/query
        this.renderJSON({ code: 0, list: [ { name:'koa-easy' } ] })
    }

    // @deprecated
    search(){
        this.renderJSON({ code:0, list: [{ name: 'koa-easy' }] })
    }
}

