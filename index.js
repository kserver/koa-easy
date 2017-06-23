const compose = require('koa-compose');
const mvc = require('./mvc');
const bodyParser = require('koa-bodyparser');
const session = require('./session');
const SessionStore = require('./SessionStore');

module.exports = function({
    routerConfig,
    sessionConfig,
    bodyConfig,
    View,
    decorator = true
} = {}, app){

    if(sessionConfig&&sessionConfig.dir){
        sessionConfig.store = new SessionStore(sessionConfig.dir);
        delete sessionConfig.dir;
    }

    return compose([
        session(sessionConfig, app),
        bodyParser(bodyConfig),
        mvc(routerConfig, View, decorator)
    ])
}
