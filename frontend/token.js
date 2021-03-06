const types = Object.freeze({
    // Single character
    COLON: Symbol(':'),
    COMMA: Symbol(','),
    LEFT_ROUND_BRACKET: Symbol('('),
    RIGHT_ROUND_BRACKET: Symbol(')'),
    LEFT_SQUARE_BRACKET: Symbol('['),
    RIGHT_SQUARE_BRACKET: Symbol(']'),
    LEFT_CURLY_BRACKET: Symbol('{'),
    RIGHT_CURLY_BRACKET: Symbol('}'),
    STAR: Symbol('*'),
    MINUS: Symbol('-'),
    SLASH: Symbol('/'),
    CIRCUMFLEX: Symbol('^'),
    PERCENTAGE: Symbol('%'),
    QUESTION_MARK: Symbol('?'),

    // Single or double character
    EXCLAMATION_MARK: Symbol('!'),
    NOT_EQUAL: Symbol('!='),
    EQUAL: Symbol('='),
    EQUAL_EQUAL: Symbol('=='),
    ARROW: Symbol('=>'),
    PLUS: Symbol('+'),
    PLUS_PLUS: Symbol('++'),
    GREATER: Symbol('>'),
    GREATER_EQUAL: Symbol('>='),
    LESS: Symbol('<'),
    LESS_EQUAL: Symbol('<='),

    // Literals
    IDENTIFIER: Symbol('identifier'),
    STRING: Symbol('string'),
    NUMBER: Symbol('number'),

    // Keywords
    AND: Symbol('and'),
    OR: Symbol('or'),
    XOR: Symbol('xor'),
    IF: Symbol('if'),
    ELIF: Symbol('elif'),
    ELSE: Symbol('else'),
    TRUE: Symbol('true'),
    FALSE: Symbol('false'),
    FUNC: Symbol('func'),
    RET: Symbol('ret'),
    LET: Symbol('let'),
    WHILE: Symbol('while'),
    PRINT: Symbol('print'),
    NIHL: Symbol('nihl'),
    BREAK: Symbol('break'),
    CONTINUE: Symbol('continue'),

    // special
    INDENT: Symbol('indent'),
    DEDENT: Symbol('dedent'),
    NEW_LINE: Symbol('new line'),

    // eof
    EOF: Symbol('eof'),
});

function makeToken(type, lexeme, line, value=null) {
    return {
        type, lexeme, line, value,
        toString: () => `${type.toString()} ${lexeme} ${value}`,
    };
}

exports.types = types;
exports.makeToken = makeToken;
