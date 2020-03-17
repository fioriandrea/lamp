const {RuntimeError} = require('../errors/errors.js');
const er = require('../errors/errorReporter.js');

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

    isBoolean(val) {
        return val === true || val === false;
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

    isGettable(val) {
        return this.isMap(val) || this.isArray(val) || this.isString(val);
    },

    isSettable(val) {
        return this.isMap(val) || this.isArray(val);
    },

    isIntegerIndexed(val) {
        return this.isArray(val) || this.isString(val);
    },

    runtimeError(operator, message) {
        const rte = new RuntimeError(operator, message);
        return rte;
    },

    print(arg) {
        console.log(this.stringify(arg));
    },

    stringify(arg) {
        return this._stringifyCircular(arg, [arg]);
    },

    _stringifyCircular(obj, seen) {
        if (obj === null) return 'nihl';
        if (this.isBoolean(obj)) return `${obj}`;
        else if (this.isNumber(obj)) return `${obj}`;
        else if (this.isString(obj)) return `'${obj}'`;

        let res = [];
        obj.forEach((value, key) => {
            let strValue;
            let strKey;
            if (seen.includes(value)) strValue = '[Circular]';
            else strValue = this._stringifyCircular(value, seen);

            if (seen.includes(key)) strValue = '[Circular]';
            else strKey = this._stringifyCircular(key, seen);

            if (typeof value === 'object') seen.push(value);
            if (typeof key === 'object') seen.push(key);

            if (this.isArray(obj)) {
                res.push(strValue);
            } else { // isMap
                res.push(strKey + ` => ` + strValue);
            }
        });
        return `${this.isArray(obj) ? '[' : '{'}${res.join(', ')}${this.isArray(obj) ? ']' : '}'}`;
    },
};
