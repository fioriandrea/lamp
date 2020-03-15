const {RuntimeError} = require('./errors/errors.js');
const er = require('./errors/errorReporter.js');

module.exports = {
    isFunction(fun) {
        return ((typeof fun) === 'object') && ('arity' in fun) && ('call' in fun);
    },

    concat(left, right) {
        if (this.isArray(left)) return left.concat(right);
        else return left + right;
    },

    isTruthy(val) {
        if (val === false || val === null || val === 0) return false;
        else return true;
    },

    isNumber(val) {
        return (typeof val) === 'number';
    },

    isInteger(val) {
        return Number.isInteger(val);
    },

    isString(val) {
        return (typeof val) === 'string';
    },

    isArray(val) {
        return Array.isArray(val);
    },

    isMap(val) {
        return (typeof val === 'object') && (val instanceof Map);
    },

    isIndexable(val) {
        return this.isMap(val) || this.isArray(val);
    },

    runtimeError(operator, message) {
        const rte = new RuntimeError(operator, message);
        return rte;
    },

    print(arg) {
        if (arg === null) console.log('nihl');
        else console.log(arg);
    },

    stringify(arg) {
        if (arg === null) return 'nihl';
        else return arg; // todo: do something which is not this hack
    }
};
