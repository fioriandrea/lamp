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

exports.Block = class {
    constructor(statList) {
        this.statList = statList;
    }

    accept(visitor) {
        return visitor.visitBlockStat(this);
    }
}

exports.If = class {
    constructor(conditionalList) {
        this.conditionalList = conditionalList;
    }

    accept(visitor) {
        return visitor.visitIfStat(this);
    }
}

exports.While = class {
    constructor(condition, block) {
        this.condition = condition;
        this.block = block;
    }

    accept(visitor) {
        return visitor.visitWhileStat(this);
    }
}

exports.Func = class {
    constructor(identifier, paramList, body) {
        this.identifier = identifier;
        this.paramList = paramList;
        this.body = body;
    }

    accept(visitor) {
        return visitor.visitFuncStat(this);
    }
}

