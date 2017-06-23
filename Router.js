
const Rule = require('./Rule');
const Route = require('./Route');
const p = require('path');

const rulesKey = Symbol('#rules');
const areasKey = Symbol('#areas');
const getMatchedResultKey = Symbol('#getMatchedResultKey');

module.exports = class Router{
    get rules(){
        return this[rulesKey];
    }
    get areas(){
        return this[areasKey];
    }
    constructor({ 
        rules = [],
        areas = []
    } = {}){
        if(rules.length===0){
            rules.push('{{controller:home}}/{{action:index}}')
        }
        this[areasKey] = areas;
        this[rulesKey] = [];
        for(let rule of rules){
            this[rulesKey].push(new Rule(rule));
        }
    }

    [getMatchedResultKey](path){
        for(let rule of this.rules){
            const result = rule.match(path);
            if(result) return result;
        }
        return null;
    }

    match(path){
        if(path.startsWith('/')) path = path.substr(1);
        let area = '';
        let areaPath = '';
        for(let areaName of this.areas){
            if(path.startsWith(areaName)){
                area = areaName;
                areaPath = p.relative(areaName, path);
            }
        }

        if(area){
            const params = this[getMatchedResultKey](areaPath);
            if(params) return new Route(params, area);
        }

        const params = this[getMatchedResultKey](path);
        if(params) return new Route(params);

        return null;
    }
    resolve(params, area){
        return p.join('/'+area, this.rules[0].resolve(params));
    }
}