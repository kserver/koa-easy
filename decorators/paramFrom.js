const Metadata = require('../reflect/Metadata');

module.exports = function(from){
    return function(name){
        return function(Controller, action){
            const meta = Metadata.getMetadata(Controller, action);
            if(!meta.$$paramFrom) meta.$$paramFrom = {};
            if(!meta.$$paramFrom[name]) meta.$$paramFrom[name] = [];
            meta.$$paramFrom[name].push(from);
            Metadata.defineMetadata(Controller, action, meta);
        }
    }
}