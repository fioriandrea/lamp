const tk = require('../token.js');

let hasCompiletimeError = false;

function reportError(line, whereInLine, report) {
    hasCompiletimeError = true;
    console.error(`Error [line ${line}]: ${whereInLine} ${report}`);
}

exports.hasCompiletimeError = function() {
    return hasCompiletimeError;
};

exports.lexerError = function(line, report) {
    reportError(line, '', report);
}

exports.parserError = function(token, report) {
    if (token.type === tk.types.EOF) {
        reportError(token.line, 'at end of file:', report);
    } else {
        reportError(token.line, `at '${token.lexeme}':`, report);
    }
}

exports.runtimeError = function(rtError, report) {
    reportError(rtError.token.line, `at '${token.lexeme}':`, report);
}
