const merge = require('lodash/merge');
const metaKey = Symbol();

exports.defineMetadata = function(obj, prop, meta){
    if(!obj[metaKey]) obj[metaKey] = {};
    if(obj[metaKey][prop]) meta = merge(obj[metaKey][prop], meta);
    obj[metaKey][prop] = meta;
}

exports.getMetadata = function(obj, prop){
    if(!obj[metaKey]) return null;
    return obj[metaKey][prop]||null;
}