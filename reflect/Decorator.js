
const Decorators = {};

exports.register = function(name, Decorator){
    if(Decorators[name]) 
        console.warn(`you have register a Decorator named ${name} before!`);
    Decorators[name] = Decorator;
}

exports.get = function(name){
    return Decorators[name];
}