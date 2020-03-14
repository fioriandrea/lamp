exports.Print = class {
    constructor(expression) {
        this.expression = expression;
    }

    accept(visitor) {
        return visitor.visitPrintStat(this);
    }
}

exports.Expression = class {
    constructor(expression) {
        this.expression = expression;
    }

    accept(visitor) {
        return visitor.visitExpressionStat(this);
    }
}

exports.Let = class {
    constructor(identifier, expression) {
        this.identifier = identifier;
        this.expression = expression;
    }

    accept(visitor) {
        return visitor.visitLetStat(this);
    }
}

