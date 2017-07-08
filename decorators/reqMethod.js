
module.exports = function(...methods){
    const accessMethods = [];

    for(let method of methods){
        if(Array.isArray(method)) accessMethods.push(...method.map(m=>m.toUpperCase()));
        else accessMethods.push(method.toUpperCase());
    }

    return function(Controller, action, descriptor){
        const v = descriptor.value;

        descriptor.value = function(...arg){
            if(!accessMethods.includes(this.request.method.toUpperCase())){
                return this.throw(404);
            }

            return v.call(this, ...arg);
        }
        return descriptor;
    }
}