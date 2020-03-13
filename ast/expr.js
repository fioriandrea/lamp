exports.makeBinaryExpr = function(left, operator, right) {
    return {
        left, operator, right,
        accept(visitor) {
            return visitor.visitBinaryExpr(this);
        }
    };
};

exports.makeUnaryExpr = function(operator, right) {
    return {
        operator, right,
        accept(visitor) {
            return visitor.visitUnaryExpr(this);
        }
    };
};

exports.makeLiteralExpr = function(value) {
    return {
        value,
        accept(visitor) {
            return visitor.visitLiteralExpr(this);
        }
    };
};

exports.makeGroupingExpr = function(expression) {
    return {
        expression,
        accept(visitor) {
            return visitor.visitGroupingExpr(this);
        }
    };
};

