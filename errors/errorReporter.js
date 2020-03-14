const tk = require('../token.js');

let hasCompiletimeError = false;

function report(line, whereInLine, report) {
    hasCompiletimeError = true;
    console.error(`Error [line ${line}]: ${whereInLine} ${report}`);
}

exports.hasCompiletimeError = function() {
    return hasCompiletimeError;
};

exports.lexerError = function(line, report) {
    report(line, '', report);
}

exports.parserError = function(token, report) {
    if (token.type === tk.types.EOF) {
        report(token.line, 'at end of file:', report);
    } else {
        report(token.line, `at '${token.lexeme}':`, report);
    }
}

exports.runtimeError = function(rtError, report) {
    report(rtError.token.line, `at '${token.lexeme}':`, report);
}
