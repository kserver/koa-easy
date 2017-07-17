const vm = require('vm');
const Decorator = require('./Decorator');
const { parseMethodArgs } = require('../utils');
const Metadata = require('./Metadata');

function parseArgs(fn){
    const args = parseMethodArgs(fn);
    return args.map(arg=>{
        const matchResult = /^\/\*\s*?param\s*?\:\s*?([\s\S]+?)\s*?\*\//.exec(arg);
        return matchResult?matchResult[1].trim():arg
    });
}

function createArgs(str){
    if(str==undefined) return undefined;
    const sand = { args:null, _:undefined };
    const context = vm.createContext(sand);
    const script = vm.createScript(`args=[${str}]`);
    script.runInContext(context);
    return sand.args;
}

function _decorate(Controller, decorators, methodName){
    let descriptor = Object.getOwnPropertyDescriptor(Controller.prototype, methodName);
    if(!descriptor) return;

    for(let { name, args } of decorators){
        const decorator = Decorator.get(name);
        if(!decorator) continue;
        descriptor = (args?decorator(...args):decorator)(Controller, methodName, descriptor)||descriptor;
    }

    Object.defineProperty(Controller.prototype, methodName, descriptor);
}

function decorate(Controller, method){
    const parts = Controller.toString().split(method.toString());
    if(parts.length!==2) return;
    const before = parts[0];
    const lines = before.split('\n').reverse();

    const decorators = [];
    for(let line of lines){
        if(line.trim()==='') continue;
         const matchResult = /^\s*\/\/\s*\@([^\s]+?)\s*(\(([\s\S]*?)\))?\s*\;?\s*$/.exec(line);
         if(matchResult){
             decorators.push({ name: matchResult[1], args: createArgs(matchResult[3]) });
             continue;
         }

         break;
    }
    if(decorators.length>0) { _decorate(Controller, decorators.reverse(), method.name) }
}

module.exports = function(Controller, decorator){
    const controllerSource = Controller.toString();
    if(!controllerSource.startsWith('class ')) return;
    
    const properties = Object.getOwnPropertyNames(Controller.prototype);
    for(let property of properties){
        if(!property.startsWith('action')) continue;
        const fn = Controller.prototype[property];
        if(typeof fn !== 'function') continue;

        _decorate(Controller, [{ name: 'params', args: parseArgs(fn) }], fn.name);
        if(decorator){
            decorate(Controller, fn);
        }
    }
}