
const paramReg = /^\{\{([a-z0-9]+)(:([a-z0-9]+))?\}\}$/;

function validController(controllerName){
    return /^([a-z0-9]+\-)*[a-z0-9]+$/.test(controllerName);
}
function validAction(actionName){
    return /^([a-z0-9]+\-)*[a-z0-9]+$/.test(actionName);
}

module.exports = class Rule {
    static validController(name){
        return validController(name);
    }
    static validAction(name){
        return validAction(name)
    }
    //_string : {{controller:home}}
    //_part
    //_minlength
    constructor(rule){
        rule = rule.replace(/\s/g, '').toLowerCase();
        this._string = rule;
        this._part = [];
        const segments = rule.split('/');

        let hasController = false;
        let hasAction = false;
        for(let segment of segments){
            const match = segment.match(paramReg);
            if(match){
                this._part.push({
                    type: 'param',
                    key: match[1],
                    default: match[3]
                });
                if(match[1]==='controller') hasController = true;
                if(match[1]==='action') hasAction = true;
            }else{
                this._part.push({
                    type: 'text',
                    value: segment
                });
            }
        }

        if(!hasController) throw new TypeError('url rule need controller param');
        if(!hasAction) throw new TypeError('url rule need action param');

        this._minlength = this._part.length;
        for(let i = this._part.length-1; i>=0; --i){
            if(this._part[i].default) this._minlength--;
            else break;
        }
    }
    match(path){
        path = path.replace(/\s/g, '').toLowerCase();
        const segments = path.split('/');
        if(segments.length < this._minlength || segments.length > this._part.length){
            return null;
        }
        
        const result = {};

        for(let i = 0; i < this._part.length; ++i){
            const p = this._part[i];
            const s = segments[i];

            switch(p.type){
                case 'text':
                    if(p.value!==s) return null;
                    break;
                case 'param':
                    result[p.key] = s||p.default;
                    break;
            }
        }

        if(!validController(result.controller)){
            console.log(`invalid controller name : ${result.controller}`);
            return null;
        }
        if(!validAction(result.action)){
            console.log(`invalid action name : ${result.action}`);
            return null;
        }

        return result;
    }
    resolve(params){
        const segments = [];
        for(let p of this._part){
            switch(p.type){
                case 'text':
                    segments.push(p.value);
                    break;
                case 'param':
                    segments.push(params[p.key]||p.default);
                    break;
            }
        }
        return segments.join('/');
    }
}