const tk = require('../token.js');

let hasCompiletimeError = false;

function reportCompiletimeError(line, whereInLine, report) {
    hasCompiletimeError = true;
    console.error(`Error [line ${line}]: ${whereInLine} ${report}`);
}

exports.hasCompiletimeError = function() {
    return hasCompiletimeError;
};

exports.lexerError = function(line, report) {
    reportCompiletimeError(line, '', report);
}

exports.parserError = function(token, report) {
    if (token.type === tk.types.EOF) {
        reportCompiletimeError(token.line, 'at end of file', report);
    } else {
        reportCompiletimeError(token.line, token.lexeme, report);
    }
}
