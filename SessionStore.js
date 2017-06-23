const os = require('os');
const path = require('path');
const fs = require('fs');

module.exports = class SessionStore{
    constructor(dir=".koasess"){
        this.sdir = path.resolve(os.tmpdir(), '.koasess-zktravel-manage');
    }
    get(key){
        const spath = path.resolve(this.sdir, key);
        try{
            if(fs.existsSync(spath)){
                return JSON.parse(fs.readFileSync(spath, 'utf8'));
            }
            return null;
        }catch(e){
            console.error(e);
            return null;
        }
    }
    set(key, sess, maxAge){
        try{
            if(!fs.existsSync(this.sdir)){
                fs.mkdirSync(this.sdir);
            }
            fs.writeFileSync(path.resolve(this.sdir, key), JSON.stringify(sess));
        }catch(e){
            console.error(e);
        }
    }
    destroy(key){
        try{
            const spath = path.resolve(this.sdir, key);
            if(fs.existsSync(spath)){
                fs.unlinkSync(spath);
            }
        }catch(e){
            console.err(e)
        }
    }
}