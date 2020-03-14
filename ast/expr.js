exports.Binary = class {
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept(visitor) {
        return visitor.visitBinaryExpr(this);
    }
}

exports.Unary = class {
    constructor(operator, right) {
        this.operator = operator;
        this.right = right;
    }

    accept(visitor) {
        return visitor.visitUnaryExpr(this);
    }
}

exports.Literal = class {
    constructor(value) {
        this.value = value;
    }

    accept(visitor) {
        return visitor.visitLiteralExpr(this);
    }
}

exports.Grouping = class {
    constructor(expression) {
        this.expression = expression;
    }

    accept(visitor) {
        return visitor.visitGroupingExpr(this);
    }
}

exports.Ternary = class {
    constructor(first, second, third) {
        this.first = first;
        this.second = second;
        this.third = third;
    }

    accept(visitor) {
        return visitor.visitTernaryExpr(this);
    }
}

exports.Logical = class {
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept(visitor) {
        return visitor.visitLogicalExpr(this);
    }
}

exports.Array = class {
    constructor(exprList) {
        this.exprList = exprList;
    }

    accept(visitor) {
        return visitor.visitArrayExpr(this);
    }
}

