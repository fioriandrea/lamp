const util = require('./util.js');

class Len {
    arity() {
        return 1;
    }

    call(interpeter, args) {
        const arg = args[0];
        if (util.isArray(arg) || util.isString(arg)) return arg.length;
        else return null;
    }

    name() {
        return 'len';
    }
}

module.exports = [new Len()];
