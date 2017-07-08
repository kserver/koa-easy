const http = require('http');
const Koa = require('koa');

const app = new Koa();

const KoaEasy = require('../');
const Decorator = require('../reflect/Decorator');

Decorator.register('deprecated', function(Controller, actionName, des){
    const value = des.value;
    des.value = function(...arg){
        value.call(this,...arg);
        if(typeof this.response.body === 'object'){
            this.response.body.deprecated = true;
        }
    }
})

app.use(KoaEasy({
    routerConfig: {
        areas: [
            'api'
        ],
        rules: '{{controller:home}}/{{action:index}}/{{id:0}}'
    },
    sessionConfig: {
        key: 'koa-easy-sess',
        maxAge: 8640000,
        dir: '.koa-easy-example'
    }
}, app));

http.createServer(app.callback()).listen(9090, '127.0.0.1');