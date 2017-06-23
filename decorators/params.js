const Metadata = require('../reflect/Metadata');

module.exports = function(...args){
    return function(Controller, action){
        Metadata.defineMetadata(Controller, action, {
            $$params:args.map(arg=>arg||undefined)
        })
    }
}