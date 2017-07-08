const Controller = require('../../Controller');

module.exports = class HomeController extends Controller {
    index(){
        this.render({ date: new Date() });
    }
    async index2(){
        await this.rewrite({ controller: 'home', action:'index'});
    }
}