const tk = require('./token.js');
const er = require('./errors/errorReporter.js');

function isNum(ch) {
    return /^[0-9]$/.test(ch);
}

function isAlpha(ch) {
    return /^[A-Za-z]$/.test(ch);
}

function isAlphaNum(ch) {
    return isAlpha(ch) || isNum(ch);
}

const keywords = Object.freeze({
    'and': tk.types.AND,
    'or': tk.types.OR,
    'if': tk.types.IF,
    'elif': tk.types.ELIF,
    'else': tk.types.ELSE,
    'true': tk.types.TRUE,
    'false': tk.types.FALSE,
    'func': tk.types.FUNC,
    'ret': tk.types.RET,
    'let': tk.types.LET,
    'while': tk.types.WHILE,
    'print': tk.types.PRINT,
    'nihl': tk.types.NIHL,
});

function tokenize(program) {
    program = program.replace(/(\r\n|\r|\n)/gm, '\n'); // remove all \r and \r\n from program
    const tokens = [];
    const indentStack = [0];
    let start = 0;
    let current = 0;
    let line = 1;

    while (!atEnd()) {
        scanToken();
        start = current;
    }

    addEmptyToken(tk.types.NEW_LINE); // to put a ';' after the last statement
    finishIndentation();
    addEmptyToken(tk.types.EOF);
    return tokens;

    // helpers

    function scanToken() {
        const ch = consume();

        switch (ch) {
            // single character
            case ':': addToken(tk.types.COLON); break;
            case ',': addToken(tk.types.COMMA); break;
            case '.': addToken(tk.types.DOT); break;
            case '(': addToken(tk.types.LEFT_ROUND_BRACKET); break;
            case ')': addToken(tk.types.RIGHT_ROUND_BRACKET); break;
            case '[': addToken(tk.types.LEFT_SQUARE_BRACKET); break;
            case ']': addToken(tk.types.RIGHT_SQUARE_BRACKET); break;
            case '{': addToken(tk.types.LEFT_CURLY_BRACKET); break;
            case '}': addToken(tk.types.RIGHT_CURLY_BRACKET); break;
            case '+': addToken(tk.types.PLUS); break;
            case '*': addToken(tk.types.STAR); break;
            case '/': addToken(tk.types.SLASH); break;
            case '^': addToken(tk.types.CIRCUMFLEX); break;
            case '%': addToken(tk.types.PERCENTAGE); break;
            case '?': addToken(tk.types.QUESTION_MARK); break;

            // comments
            case '#': comment(); break;

            // single or double character
            case '!':
                let type = tk.types.EXCLAMATION_MARK;
                if (eat('=')) type = tk.types.NOT_EQUAL;
                else if (eat('!')) type = tk.types.DOUBLE_EXCLAMATION_MARK;
                addToken(type);
                break;
            case '=': addToken(eat('=') ? tk.types.EQUAL_EQUAL : tk.types.EQUAL); break;
            case '-': addToken(eat('>') ? tk.types.ARROW : tk.types.MINUS); break;
            case '>': addToken(eat('=') ? tk.types.GREATER_EQUAL : tk.types.GREATER); break;
            case '<': addToken(eat('=') ? tk.types.LESS_EQUAL : tk.types.LESS); break;
            case ' ':
            case '\t':
            case '\r':
                break;
            case '\n':
                newLine();
                break;
            case '\'': string(); break;
            default:
                if (isNum(ch)) {
                    number();
                } else if (isAlpha(ch)) {
                    identifier();
                } else {
                    er.error(line, 'unexpected character');
                }

                break;
        }
    }

    function comment() {
        while (!atEnd() && peek() !== '\n') consume();
    }

    function newLine() {
        addEmptyToken(tk.types.NEW_LINE);
        line++;
        scanIndentation();
    }

    function string() {
        while (!atEnd() && peek() !== '\'') {
            if (peek() === '\n') line++;
            consume();
        }
        if (atEnd()) {
            er.error(line, 'unterminated string');
            return;
        }
        consume();
        const val = program.substring(start + 1, current - 1);
        addToken(tk.types.STRING, val);
    }

    function number()  {
        while (isNum(peek())) consume();
        if (peek() === '.' && isNum(peekNext())) {
            consume(); // discard '.'
            while (isNum(peek())) consume();
        }
        const val = program.substring(start, current);
        addToken(tk.types.NUMBER, parseFloat(val));
    }

    function identifier() {
        while (isAlphaNum(peek())) consume();
        const lexeme = program.substring(start, current);
        const type = keywords[lexeme] ? keywords[lexeme] : tk.types.IDENTIFIER;
        addToken(type);
    }

    function finishIndentation() {
        while (indentStack.length > 1) {
            indentStack.pop();
            addEmptyToken(tk.types.DEDENT);
        }
    }

    function getIndentation() {
        let indentation = 0;
        while (peek() === ' ' || peek() === '\t') {
            if (peek() === ' ') indentation++;
            else indentation += 4;
            consume();
        }
        return indentation;
    }

    function scanIndentation() {
        let indentation = getIndentation();
        // don't indent empty lines
        if (atEnd() || peek() === '\n') return;

        if (indentation > indentStack[indentStack.length - 1]) {
            indentStack.push(indentation);
            addEmptyToken(tk.types.INDENT);
        } else if (indentation < indentStack[indentStack.length - 1]) {
            while (indentation < indentStack[indentStack.length - 1]) {
                indentStack.pop();
                addEmptyToken(tk.types.DEDENT);
            }

            if (indentation !== indentStack[indentStack.length - 1]) {
                er.error(line, 'indentation error');
                return;
            }
        }
    }

    function addToken(type, value=null) {
        const lexeme = program.substring(start, current);
        tokens.push(tk.makeToken(type, lexeme, line, value));
    }

    function addEmptyToken(type) {
        tokens.push(tk.makeToken(type, '', line, null));
    }

    function atEnd() {
        return current >= program.length;
    }

    function consume() {
        return program[current++];
    }

    function peek() {
        return program[current];
    }

    function peekNext() {
        return program[current + 1];
    }

    function eat(ch) {
        if (atEnd()) return false;
        if (ch !== program[current]) return false;
        current++;
        return true;
    }
}

function layOut(tokens) {

    return makeCompact(removeLeadingNewLines(tokens));

    function removeLeadingNewLines(tokens) {
        const withoutLeading = tokens;
        while (withoutLeading[0].type === tk.types.NEW_LINE) withoutLeading.shift(); // remove '\n' at the beginning
        return withoutLeading;
    }

    function makeCompact(tokens) {
        const cleanTokens = [];
        for (let i = 0; i < tokens.length - 1; i++) {
            if (tokens[i].type === tk.types.NEW_LINE && tokens[i + 1].type === tk.types.INDENT)
                continue; // makes newline + indent = indent
            else if (tokens[i].type === tk.types.NEW_LINE && tokens[i + 1].type === tk.types.NEW_LINE)
                continue; // makes consecutive new lines a single new line
             else
                cleanTokens.push(tokens[i]);
        }
        cleanTokens.push(tokens[tokens.length - 1]); // last token
        return cleanTokens;
    }
}

function scan(program) {
    return layOut(tokenize(program));
}

module.exports = scan;
