const tk = require('../frontend/token.js');

let hasError = false;

function reportError(line, whereInLine, report) {
    hasError = true;
    console.error(`Error [line ${line}]: ${whereInLine} ${report}`);
}

exports.hasError = function() {
    return hasError;
};

exports.lexerError = function(line, report) {
    reportError(line, '', report);
}

exports.compiletimeError = function(token, report) {
    if (token.type === tk.types.EOF) {
        reportError(token.line, 'at end of file:', report);
    } else {
        reportError(token.line, `at '${token.lexeme}':`, report);
    }
}

exports.runtimeError = function(rtError) {
    reportError(rtError.token.line, `(at '${rtError.token.lexeme}')`, rtError.message);
}
