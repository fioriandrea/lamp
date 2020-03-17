const util = require('../util/util.js');
const fs = require('fs');
const {TypeError} = require('../errors/errors.js');

class Len {
    arity() {
        return 1;
    }

    call(interpeter, args) {
        const arg = args[0];
        if (util.isArray(arg) || util.isString(arg)) return arg.length;
        else throw new TypeError(`cannot measure length of ${arg}`);
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
        if (util.isBoolean(arg)) return 'boolean';
        else if (util.isString(arg)) return 'string';
        else if (util.isNumber(arg)) return 'number';
        else if (util.isArray(arg)) return 'array';
        else if (util.isMap(arg)) return 'map';
    }

    name() {
        return 'typeof';
    }
}

class ReadFile {
    arity() {
        return 1;
    }

    call(interpeter, args) {
        if (!util.isString(args[0])) {
            throw new TypeError(`${util.stringify(args[0])} is not a string`);
        }
        try {
            return fs.readFileSync(args[0], "utf-8");
        } catch(e) {
            return null; // file not found
        }
    }

    name() {
        return 'readFile';
    }
}

class WriteFile {
    arity() {
        return 2;
    }

    call(interpeter, args) {
        if (!util.isString(args[0])) {
            throw new TypeError(`${util.stringify(args[0])} is not a string`);
        }
        try {
            return fs.writeFileSync(args[0], util.stringify(args[1]));
        } catch(e) {
            return null; // file not found
        }
    }

    name() {
        return 'writeFile';
    }
}

class AppendFile {
    arity() {
        return 2;
    }

    call(interpeter, args) {
        if (!util.isString(args[0])) {
            throw new TypeError(`${util.stringify(args[0])} is not a string`);
        }
        try {
            return fs.appendFileSync(args[0], util.stringify(args[1]));
        } catch(e) {
            return null; // file not found
        }
    }

    name() {
        return 'appendFile';
    }
}

class Clock {
    arity() {
        return 0;
    }

    call(interpeter, args) {
        return Date.now();
    }

    name() {
        return 'clock';
    }
}

module.exports = [new Len(), new Typeof(), new ReadFile(), new WriteFile(),
                  new AppendFile(), new Clock()];
