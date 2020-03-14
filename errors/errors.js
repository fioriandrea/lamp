class ParseError extends Error {
    constructor(token, message) {
        super(message);
        this.token = token;
    }
}

class RuntimeError extends Error {
    constructor(token, message) {
        super(message);
        this.token = token;
    }
}

exports.ParseError = ParseError;
exports.RuntimeError = RuntimeError;
