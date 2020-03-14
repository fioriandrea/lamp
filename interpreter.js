const tk = require('./token.js');
const er = require('./errors/errorReporter.js');
const {RuntimeError} = require('./errors/errors.js');

class Interpreter {
    evaluate(expr) {
        return expr.accept(this);
    }

    visitBinaryExpr(expr) {
        const left = this.evaluate(expr.left);
        const operator = expr.operator;
        const right = this.evaluate(expr.right);

        switch (operator.type) {
            case tk.types.COMMA:
                return right;
                break;
            case tk.types.PLUS_PLUS:
                this._checkBothConcatenable(left, operator, right);
                return this._concat(left, right);
                break;
            case tk.types.PLUS:
                this._checkBothNumbers(left, operator, right);
                return left + right;
                break;
            case tk.types.MINUS:
                this._checkBothNumbers(left, operator, right);
                return left - right;
                break;
            case tk.types.STAR:
                this._checkBothNumbers(left, operator, right);
                return left * right;
                break;
            case tk.types.SLASH:
                this._checkBothNumbers(left, operator, right);
                return left / right;
                break;
            case tk.types.PERCENTAGE:
                this._checkBothIntegers(left, operator, right);
                return left % right;
                break;
            case tk.types.CIRCUMFLEX:
                this._checkBothNumbers(left, operator, right);
                return left ** right;
                break;
            case tk.types.EQUAL_EQUAL:
                return left === right;
                break;
            case tk.types.NOT_EQUAL:
                return left !== right;
                break;
            case tk.types.LESS:
                this._checkBothNumbers(left, operator, right);
                return left < right;
                break;
            case tk.types.LESS_EQUAL:
                this._checkBothNumbers(left, operator, right);
                return left <= right;
                break;
            case tk.types.GREATER:
                this._checkBothNumbers(left, operator, right);
                return left > right;
                break;
            case tk.types.GREATER_EQUAL:
                this._checkBothNumbers(left, operator, right);
                return left >= right;
                break;
        }
    }

    visitUnaryExpr(expr) {
        const operator = expr.operator;
        const right = expr.right;

        switch (operator.type) {
            case tk.types.MINUS:
                this._checkSingleNumber(operator, right);
                return -right;
                break;
            case tk.types.EXCLAMATION_MARK:
                return this._isTruthy(right);
                break;
        }
    }

    visitLiteralExpr(expr) {
        return expr.value;
    }

    visitGroupingExpr(expr) {
        return this.evaluate(expr.expression);
    }

    visitTernaryExpr(expr) {
        const firstExpr = expr.first;
        const secondExpr = expr.second;
        const thirdExpr = expr.third;
        return this._isTruthy(this.evaluate(firstExpr)) ? this.evaluate(secondExpr) : this.evaluate(thirdExpr);
    }

    visitLogicalExpr(expr) {
        const left = this.evaluate(expr.left);
        const operator = expr.operator;

        switch (operator.type) {
            case tk.types.OR:
                return this._isTruthy(left) ? true : this.evaluate(expr.right);
                break;
            case tk.types.AND:
                return !this._isTruthy(left) ? false : this.evaluate(expr.right);
                break;
            case tk.types.XOR:
                const right = this.evaluate(expr.right);
                return this._isTruthy(left) ? !this._isTruthy(right) : this._isTruthy(right);
                break;
        }
    }

    visitArrayExpr(expr) {
        const valueList = [];
        for (let i = 0; i < expr.exprList.length; i++) {
            valueList.push(this.evaluate(expr.exprList[i]));
        }
        return valueList;
    }

    _concat(left, right) {
        if (this._isArray(left)) return left.concat(right);
        else return left + right;
    }

    _isTruthy(val) {
        if (val === false || val === null || val === 0) return false;
        else return true;
    }

    _isNumber(val) {
        return (typeof val) === 'number';
    }

    _isInteger(val) {
        return Number.isInteger(val);
    }

    _isString(val) {
        return (typeof val) === 'string';
    }

    _isArray(val) {
        return Array.isArray(val);
    }

    _checkBothConcatenable(left, operator, right) {
        if ((this._isArray(left) && this._isArray(right)) ||
        (this._isString(left) && this._isString(right))) return;

        throw this._error(operator, 'operands must be both strings or both arrays');
    }

    _error(operator, message) {
        const rte = new RuntimeError(operator, message);
        er.runtimeError(rte);
        return rte;
    }

    _checkAllType(operator, message, typeCheck, vals) {
        for (let i = 0; i < vals.length; i++) {
            if (!typeCheck(vals[i])) {
                throw this._error(operator, message);
            }
        }
    }

    _checkAllNumbers(operator, message, ...vals) {
        this._checkAllType(operator, message, val => this._isNumber(val), vals);
    }

    _checkAllIntegers(operator, message, ...vals) {
        this._checkAllType(operator, message, val => this._isInteger(val), vals);
    }

    _checkBothNumbers(left, operator, right) {
        this._checkAllNumbers(operator, 'operands must be numbers', left, right);
    }

    _checkBothIntegers(left, operator, right) {
        this._checkAllIntegers(operator, 'operands must be integers', left, right);
    }

    _checkSingleNumber(operator, right) {
        this._checkAllNumbers(operator, 'operand must be a number', right);
    }
}

module.exports = Interpreter;
