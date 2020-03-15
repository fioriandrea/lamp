const er = require('./errors/errorReporter.js');

class Resolver {
    constructor(hopTable) {
        this.hopTable = hopTable; // Map object
        this.scopes = [{}]; // stack with an empty scope on top
        this.functionCounter = 0;
    }

    start(statList) {
        statList.forEach(s => this.resolve(s));
    }

    resolve(visited) {
        return visited.accept(this);
    }

    // statements

    visitPrintStat(stat) {
        this.resolve(stat.expression);
    }

    visitLetStat(stat) {
        this._declare(stat.identifier);
        if (stat.expression !== null) this.resolve(stat.expression);
        this._define(stat.identifier);
    }

    visitBlockStat(stat) {
        this._beginScope();
        stat.statList.forEach(s => this.resolve(s));
        this._endScope();
    }

    visitIfStat(stat) {
        stat.conditionalList.forEach(c => {
            this.resolve(c[0]);
            this.resolve(c[1]);
        });
    }

    visitWhileStat(stat) {
        this.resolve(stat.condition);
        this.resolve(stat.block);
    }

    visitFuncStat(stat) {
        this.functionCounter++;

        this._declare(stat.identifier);
        this._define(stat.identifier);

        this._beginScope();
        stat.paramList.forEach(p => {
            this._declare(p);
            this._define(p);
        });
        stat.body.statList.forEach(s => this.resolve(s));
        this._endScope();

        this.functionCounter--;
    }

    visitRetStat(stat) {
        if (this.functionCounter <= 0) {
            er.compiletimeError(stat.token, 'can\'t have a ret statement outside of a function');
        }
        if (stat.value !== null) this.resolve(stat.value);
    }

    visitBreakStat(stat) {
        return;
    }

    visitContinueStat(stat) {
        return;
    }

    visitExpressionStat(stat) {
        this.resolve(stat.expression);
    }

    // expressions

    visitBinaryExpr(expr) {
        this.resolve(expr.left);
        this.resolve(expr.right);
    }

    visitUnaryExpr(expr) {
        this.resolve(expr.right);
    }

    visitLiteralExpr(expr) {
        return;
    }

    visitGroupingExpr(expr) {
        this.resolve(expr.expression);
    }

    visitTernaryExpr(expr) {
        this.resolve(expr.first);
        this.resolve(expr.second);
        this.resolve(expr.third);
    }

    visitCallExpr(expr) {
        this.resolve(expr.nameExpr);
        expr.argList.forEach(a => this.resolve(a));
    }

    visitLogicalExpr(expr) {
        this.resolve(expr.left);
        this.resolve(expr.right);
    }

    visitAssignExpr(expr) {
        this.resolve(expr.expression);
        this.resolve(expr.assigned);
    }

    visitVariableExpr(expr) {
        if (this._peek()[expr.token.lexeme] === false) {
            er.compiletimeError(expr.token, 'can\'t read local variable in its own initializer');
        }
        this._deliverVarHops(expr, expr.token.lexeme);
    }

    _deliverVarHops(expr, lexeme) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i][lexeme] !== undefined) {
                this.hopTable.set(expr, this.scopes.length - 1 - i);
                break;
            }
        }

        // else assume built-in constant
    }

    visitArrayExpr(expr) {
        expr.exprList.forEach(e => this.resolve(e));
    }

    visitMapExpr(expr) {
        expr.exprPairs(ep => {
            this.resolve(ep[0]);
            this.resolve(ep[1]);
        });
    }

    // helpers

    _peek() {
        return this.scopes[this.scopes.length - 1];
    }

    _declare(token) {
        return this._peek()[token.lexeme] = false;
    }

    _define(token) {
        return this._peek()[token.lexeme] = true;
    }

    _beginScope() {
        this.scopes.push({});
    }

    _endScope() {
        this.scopes.pop();
    }
}

module.exports = Resolver;
