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

class TypeError extends Error {
    constructor(message) {
        super(message);
    }
}

exports.ParseError = ParseError;
exports.RuntimeError = RuntimeError;
exports.TypeError = TypeError;
