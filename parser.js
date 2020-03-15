const tk = require('./token.js');
const er = require('./errors/errorReporter.js');
const ex = require('./ast/expr.js');
const st = require('./ast/stat.js');
const {ParseError} = require('./errors/errors.js');

function parse(tokens) {
    let scan = 0;

    return program();

    function program() {
        const statList = [];
        while (!atEnd()) {
            statList.push(statement());
        }
        return statList;
    }

    // statements

    function statement() {
        try { // cannot have block by itself
            if (eatAny(tk.types.PRINT)) return print();
            else if (eatAny(tk.types.LET)) return let();
            else if (eatAny(tk.types.IF)) return ifStat();
            else if (eatAny(tk.types.WHILE)) return whileStat();
            else if (eatAny(tk.types.FUNC)) return func();
            else if (eatAny(tk.types.RET)) return ret();
            else if (eatAny(tk.types.BREAK)) return breakStat();
            else if (eatAny(tk.types.CONTINUE)) return continueStat();
            else return expressionStat();
        } catch(e) {
            synchronize();
            return null; // garbage statement
        }
    }

    function print() {
        const expr = expression();
        eatError(tk.types.NEW_LINE, 'expect new line after print statement');
        return new st.Print(expr);
    }

    function let() {
        eatError(tk.types.IDENTIFIER, 'expect variable name');
        const identifier = previous();
        let valueExpr = null;
        if (eatAny(tk.types.EQUAL)) { // optional initialization
            valueExpr = expression();
        }
        eatError(tk.types.NEW_LINE, 'expect new line after let statement');
        return new st.Let(identifier, valueExpr);
    }

    function block() {
        const statList = [];
        while (!check(tk.types.DEDENT)) {
            statList.push(statement());
        }

        eatError(tk.types.DEDENT, 'expect DEDENT after block');
        return new st.Block(statList);
    }

    function ifStat() {
        const conditionalList = [];

        // if
        let condition = expression();
        eatError(tk.types.INDENT, 'expect INDENT after if condition');
        let blockStat = block();
        conditionalList.push([condition, blockStat]);

        // elif
        while (eatAny(tk.types.ELIF)) {
            condition = expression();
            eatError(tk.types.INDENT, 'expect INDENT after elif condition');
            blockStat = block();
            conditionalList.push([condition, blockStat]);
        }

        //else
        if (eatAny(tk.types.ELSE)) {
            condition = expression();
            eatError(tk.types.INDENT, 'expect INDENT after else');
            blockStat = block();
            conditionalList.push([condition, blockStat]);
        }

        return new st.If(conditionalList);
    }

    function whileStat() {
        const condition = expression();
        eatError(tk.types.INDENT, 'expect INDENT after while condition');
        const blockStat = block();
        return new st.While(condition, blockStat);
    }

    function func() {
        eatError(tk.types.IDENTIFIER, 'expect identifier after \'function\'');
        const identifier = previous();
        eatError(tk.types.LEFT_ROUND_BRACKET, 'expect \'(\' after function name');

        let paramList = [];
        if (!eatAny(tk.types.RIGHT_ROUND_BRACKET)) {
            do {
                eatError(tk.types.IDENTIFIER, 'expect identifier as function parameter');
                let identifier = previous();
                paramList.push(identifier);
            } while (eatAny(tk.types.COMMA));
            eatError(tk.types.RIGHT_ROUND_BRACKET, 'expect \')\' after function parameters');
        }

        eatError(tk.types.INDENT, 'expect INDENT before function body');
        const body = block();

        return new st.Func(identifier, paramList, body);
    }

    function ret() {
        if (eatAny(tk.types.NEW_LINE)) return new st.Ret(null);
        const value = expression();
        eatError(tk.types.NEW_LINE, 'expect new line after ret statement');
        return new st.Ret(value);
    }

    function breakStat() {
        const token = previous();
        eatAny(tk.types.NEW_LINE, 'expect new line after break statement');
        return new st.Break(token);
    }

    function continueStat() {
        const token = previous();
        eatAny(tk.types.NEW_LINE, 'expect new line after continue statement');
        return new st.Continue(token);
    }

    function expressionStat() {
        const expr = expression();
        eatError(tk.types.NEW_LINE, 'expect new line after expression statement');
        return new st.Expression(expr);
    }

    // expressions

    function expression() {
        return comma();
    }

    function comma() {
        let left = nonCommaExpr();
        while (eatAny(tk.types.COMMA)) {
            const operator = previous();
            const right = nonCommaExpr();
            left = new ex.Binary(left, operator, right);
        }
        return left;
    }

    function nonCommaExpr() {
        return assign();
    }

    function assign() {
        let assigned = ternary();

        if (eatAny(tk.types.EQUAL)) {
            const equal = previous();
            const value = expression();

            if (assigned instanceof ex.Variable) {
                return new ex.Assign(assigned, value);
            }

            error(equal, 'invalid assignment target')
        }

        return assigned;
    }

    function ternary() {
        let first = logicalSum();
        if (eatAny(tk.types.QUESTION_MARK)) {
            const second = ternary();
            eatError(tk.types.COLON, 'expect \':\' after \'?\' in ternary expression');
            const third = ternary();
            first = new ex.Ternary(first, second, third);
        }
        return first;
    }

    function logicalSum() {
        let left = and();
        while (eatAny(tk.types.OR, tk.types.XOR)) {
            const operator = previous();
            const right = and();
            left = new ex.Logical(left, operator, right);
        }
        return left;
    }

    function and() {
        let left = equal();
        while (eatAny(tk.types.AND)) {
            const operator = previous();
            const right = equal();
            left = new ex.Logical(left, operator, right);
        }
        return left;
    }

    function equal() {
        let left = comparison();
        while (eatAny(tk.types.EQUAL_EQUAL, tk.types.NOT_EQUAL)) {
            const operator = previous();
            const right = comparison();
            left = new ex.Binary(left, operator, right);
        }
        return left;
    }

    function comparison() {
        let left = sum();
        while (eatAny(tk.types.GREATER, tk.types.GREATER_EQUAL, tk.types.LESS, tk.types.LESS_EQUAL)) {
            const operator = previous();
            const right = sum();
            left = new ex.Binary(left, operator, right);
        }
        return left;
    }

    function sum() {
        let left = mult();
        while (eatAny(tk.types.PLUS, tk.types.MINUS, tk.types.PLUS_PLUS)) {
            const operator = previous();
            const right = mult();
            left = new ex.Binary(left, operator, right);
        }
        return left;
    }

    function mult() {
        let left = pow();
        while (eatAny(tk.types.STAR, tk.types.SLASH, tk.types.PERCENTAGE)) {
            const operator = previous();
            const right = pow();
            left = new ex.Binary(left, operator, right);
        }
        return left;
    }

    function pow() {
        const left = unary();
        if (eatAny(tk.types.CIRCUMFLEX)) {
            const operator = previous();
            const right = pow();
            return new ex.Binary(left, operator, right);
        }
        return left;
    }

    function unary() {
        if (eatAny(tk.types.MINUS, tk.types.EXCLAMATION_MARK)) {
            const operator = previous();
            const right = unary();
            return new ex.Unary(operator, right);
        }
        return call();
    }

    function call() {
        let caller = primary();
        while (eatAny(tk.types.LEFT_ROUND_BRACKET)) {
            caller = argList(caller);
        }

        return caller;

        function argList(caller) {
            if (eatAny(tk.types.RIGHT_ROUND_BRACKET)) {
                return  new ex.Call(caller, previous(), []);
            }

            const args = [];
            do {
                args.push(nonCommaExpr());
            } while (eatAny(tk.types.COMMA));
            eatError(tk.types.RIGHT_ROUND_BRACKET, 'expect \')\' after function call');
            return new ex.Call(caller, previous(), args);
        }
    }

    function primary() {
        if (eatAny(tk.types.STRING, tk.types.NUMBER)) {
            return new ex.Literal(previous().value);
        } else if (eatAny(tk.types.TRUE)) {
            return new ex.Literal(true);
        } else if (eatAny(tk.types.FALSE)) {
            return new ex.Literal(false);
        } else if (eatAny(tk.types.NIHL)) {
            return new ex.Literal(null);
        } else if (eatAny(tk.types.LEFT_ROUND_BRACKET)) { // group
            const expr = expression();
            eatError(tk.types.RIGHT_ROUND_BRACKET, 'expect \')\' after expression');
            return new ex.Grouping(expr);
        } else if (eatAny(tk.types.IDENTIFIER)) {
            return new ex.Variable(previous());
        } else if (eatAny(tk.types.LEFT_SQUARE_BRACKET)) { // array literal
            return array();
        } else if (eatAny(tk.types.LEFT_CURLY_BRACKET)) { // map literal
            return map();
        } else {
            throw error(peek(), 'unexpected token');
        }
    }

    function array() {
        if (eatAny(tk.types.RIGHT_SQUARE_BRACKET)) {
            return new ex.Array([]);
        }

        const valueList = [nonCommaExpr()];
        while (check(tk.types.COMMA)) {
            consume();
            valueList.push(nonCommaExpr());
        }
        eatError(tk.types.RIGHT_SQUARE_BRACKET, 'expect \']\' after array literal');
        return new ex.Array(valueList);
    }

    function map() {
        if (eatAny(tk.types.RIGHT_CURLY_BRACKET)) {
            return new ex.Map([]);
        }

        const pairList = [];

        let pair = [nonCommaExpr()];
        eatError(tk.types.ARROW, 'expect \'=>\' inside map');
        pair.push(nonCommaExpr());
        pairList.push(pair);
        while (eatAny(tk.types.COMMA)) {
            pair = [];
            pair.push(nonCommaExpr());
            eatError(tk.types.ARROW, 'expect \'=>\' inside map');
            pair.push(nonCommaExpr());
            pairList.push(pair);
        }
        eatError(tk.types.RIGHT_CURLY_BRACKET, 'expect \'}\' after map literal');
        return new ex.Map(pairList);
    }

    function eatAny(...types) {
        for (let i = 0; i < types.length; i++) {
            if (check(types[i])) {
                consume();
                return true;
            }
        }
        return false;
    }

    function eatError(type, message) {
        if (eatAny(type)) return;
        throw error(peek(), message);
    }

    function error(token, message) {
        er.compiletimeError(token, message);
        return new ParseError(token, message);
    }

    function synchronize() {
        consume();
        while (!atEnd()) {
            if (previous().type === tk.types.NEW_LINE) return;
            switch (peek().type) {
                case tk.types.IF:
                case tk.types.FUNC:
                case tk.types.RET:
                case tk.types.LET:
                case tk.types.WHILE:
                case tk.types.PRINT:
                    return;
                    break;
            }
            consume();
        }
    }

    function previous() {
        return tokens[scan - 1];
    }

    function peek() {
        return tokens[scan];
    }

    function check(type) {
        return !atEnd() && tokens[scan].type === type;
    }

    function consume() {
        if (!atEnd()) scan++;
        return previous();
    }

    function atEnd() {
        return peek().type === tk.types.EOF;
    }
}


exports.parse = parse;
