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

    runtimeError(operator, message) {
        const rte = new RuntimeError(operator, message);
        er.runtimeError(rte);
        return rte;
    },
};
