const util = require('../util/util.js');

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

class Typeof {
    arity() {
        return 1;
    }

    call(interpeter, args) {
        const arg = args[0];
        if (arg === null) return 'nihl';
        else if (util.isString(arg)) return 'string';
        else if (util.isNumber(arg)) return 'number';
        else if (util.isArray(arg)) return 'array';
        else if (util.isMap(arg)) return 'map';
        else return 'undefined_type';
    }

    name() {
        return 'typeof';
    }
}

module.exports = [new Len(), new Typeof()];
