const tk = require('./token.js');
const Environment = require('./environment.js');
const util = require('./util.js');
const builtins = require('./builtins.js');
const jumps = require('./jumps.js');

class Function {
    constructor(funcStat, closure) {
        this.funcStat = funcStat;
        this.closure = closure;
    }

    arity() {
        return this.funcStat.paramList.length;
    }

    call(interpreter, args) {
        const env = new Environment(this.closure);
        for (let i = 0; i < this.arity(); i++) {
            env.define(this.funcStat.paramList[i].lexeme, args[i]);
        }
        interpreter.executeBlockStat(this.funcStat.body.statList, env);
    }
}

class Interpreter {
    constructor(statList) {
        this.statList = statList;
        this.global = new Environment();
        this.environment = new Environment(this.global);
        this._initializeNatives();
    }

    _initializeNatives() {
        builtins.forEach(n => this.global.define(n.name(), n));
    }

    interpret() {
        try {
            for (let i = 0; i < this.statList.length; i++) {
                this.execute(this.statList[i]);
            }
        } catch(e) {
            util.runtimeError(e);
        }
    }

    execute(visited) {
        return visited.accept(this);
    }

    // statements

    visitPrintStat(stat) {
        const expr = this.execute(stat.expression);
        console.log(expr);
    }

    visitLetStat(stat) {
        const name = stat.identifier.lexeme;
        const value = stat.expression === null ? null : this.execute(stat.expression);
        this.environment.define(name, value);
    }

    visitBlockStat(stat) {
        this.executeBlockStat(stat.statList, new Environment(this.environment));
    }

    // execute block with the given environment (useful for functions)
    executeBlockStat(statList, environment) {
        try {
            this.environment = environment;
            statList.forEach(stat => this.execute(stat));
        } finally {
            this.environment = environment.enclosing;
        }
    }

    visitIfStat(stat) {
        const conditionalList = stat.conditionalList;

        for (let i = 0; i < conditionalList.length; i++) {
            const condition = this.execute(conditionalList[i][0]);
            const body = conditionalList[i][1];

            if (util.isTruthy(condition)) {
                this.execute(body);
                break;
            }
        }
    }

    visitWhileStat(stat) {
        while (util.isTruthy(this.execute(stat.condition))) {
            try {
                this.execute(stat.block);
            } catch(e) {
                if (e instanceof jumps.BreakJump) break;
                else if (e instanceof jumps.ContinueJump) continue;
                else throw e;
            }
        }
    }

    visitFuncStat(stat) {
        const func = new Function(stat, this.environment);
        this.environment.define(stat.identifier.lexeme, func);
    }

    visitRetStat(stat) {
        const value = stat.value === null ? null : this.execute(stat.value);
        throw new jumps.ReturnJump(value);
    }

    visitBreakStat(stat) {
        throw new jumps.BreakJump();
    }

    visitContinueStat(stat) {
        throw new jumps.ContinueJump();
    }

    visitExpressionStat(stat) {
        this.execute(stat.expression);
    }

    // expressions

    visitBinaryExpr(expr) {
        const left = this.execute(expr.left);
        const operator = expr.operator;
        const right = this.execute(expr.right);

        switch (operator.type) {
            case tk.types.COMMA:
                return right;
                break;
            case tk.types.PLUS_PLUS:
                this._checkBothConcatenable(left, operator, right);
                return util.concat(left, right);
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
                this._checkBothComparable(left, operator, right);
                return left < right;
                break;
            case tk.types.LESS_EQUAL:
                this._checkBothComparable(left, operator, right);
                return left <= right;
                break;
            case tk.types.GREATER:
                this._checkBothComparable(left, operator, right);
                return left > right;
                break;
            case tk.types.GREATER_EQUAL:
                this._checkBothComparable(left, operator, right);
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
                return util.isTruthy(right);
                break;
        }
    }

    visitLiteralExpr(expr) {
        return expr.value;
    }

    visitGroupingExpr(expr) {
        return this.execute(expr.expression);
    }

    visitTernaryExpr(expr) {
        const firstExpr = expr.first;
        const secondExpr = expr.second;
        const thirdExpr = expr.third;
        return util.isTruthy(this.execute(firstExpr)) ? this.execute(secondExpr) : this.execute(thirdExpr);
    }

    visitAssignExpr(expr) {
        const assigned = expr.assigned.token;
        const expression = this.execute(expr.expression);
        return this.environment.assign(assigned, expression);
    }

    visitCallExpr(expr) {
        const callee = this.execute(expr.nameExpr);
        const args = expr.argList.map(arg => this.execute(arg));
        if (!util.isFunction(callee)) {
            throw util.runtimeError(expr.bracket, `${callee} is not a function`);
        } else if (callee.arity() !== args.length) {
            throw util.runtimeError(expr.bracket, `expected ${callee.arity()} arguments but got ${args.length}`);
        }
        try {
            return callee.call(this, args);
        } catch(e) {
            if (e instanceof jumps.ReturnJump) {
                return e.value;
            } else {
                throw e;
            }
        }
    }

    visitLogicalExpr(expr) {
        const left = this.execute(expr.left);
        const operator = expr.operator;

        switch (operator.type) {
            case tk.types.OR:
                return util.isTruthy(left) ? true : this.execute(expr.right);
                break;
            case tk.types.AND:
                return !util.isTruthy(left) ? false : this.execute(expr.right);
                break;
            case tk.types.XOR:
                const right = this.execute(expr.right);
                return util.isTruthy(left) ? !util.isTruthy(right) : util.isTruthy(right);
                break;
        }
    }

    visitVariableExpr(expr) {
        return this.environment.get(expr.token);
    }

    visitArrayExpr(expr) {
        const valueList = [];
        for (let i = 0; i < expr.exprList.length; i++) {
            valueList.push(this.execute(expr.exprList[i]));
        }
        return valueList;
    }

    visitMapExpr(expr) {
        const pairs = expr.exprPairs.map(p => [this.execute(p[0]), this.execute(p[1])]);
        return new Map(pairs);
    }

    // helpers

    _checkBothConcatenable(left, operator, right) {
        if ((util.isArray(left) && util.isArray(right)) ||
        (util.isString(left) && util.isString(right))) return;

        throw util.runtimeError(operator, 'operands must be both strings or both arrays');
    }

    _checkBothComparable(left, operator, right) {
        this._checkBothNumbers(left, operator, right);
    }

    _checkBothNumbers(left, operator, right) {
        if (util.isNumber(left) && util.isNumber(right)) return;
        throw util.runtimeError(operator, 'operands must be numbers');
    }

    _checkBothIntegers(left, operator, right) {
        if (util.isInteger(left) && util.isInteger(right)) return;
        throw util.runtimeError(operator, 'operands must be integers');
    }

    _checkSingleNumber(operator, right) {
        if (util.isNumber(right)) return;
        throw util.runtimeError(operator, 'operand must be a number');
    }
}

module.exports = Interpreter;
