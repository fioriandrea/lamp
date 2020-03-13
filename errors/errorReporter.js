let hasCompiletimeError = false;

function reportError(line, whereInLine, report) {
    console.error(`Error [line ${line}]: ${whereInLine} ${report}`);
}

exports.hasCompiletimeError = function() {
    return hasCompiletimeError;
};

exports.error = function(line, report) {
    reportError(line, '', report);
}
