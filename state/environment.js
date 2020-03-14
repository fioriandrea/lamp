const {RuntimeError} = require('../errors/errors.js');

class Environment {
    constructor(enclosing=null) {
        this.enclosing = enclosing;
        this.space = {};
    }

    define(lexeme, value) {
        this.space[lexeme] = value;
    }

    assign(token, value) {
        const lexeme = token.lexeme;
        if (this.space[lexeme] !== undefined) {
            this.space[lexeme] = value;
            return value;
        } else if (this.enclosing !== null) {
            this.enclosing.assign(token, value);
            return value;
        } else {
            throw new RuntimeError(token, `undefined variable '${lexeme}'`);
        }
    }

    get(token) {
        const lexeme = token.lexeme;
        if (this.space[lexeme] !== undefined) {
            return this.space[lexeme];
        } else if (this.enclosing !== null) {
            return this.enclosing.get(token);
        } else {
            throw new RuntimeError(token, `undefined variable '${lexeme}'`);
        }
    }
}

module.exports = Environment;
