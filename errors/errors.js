class ParseError extends Error {
    constructor(token, message) {
        super(message);
        this.token = token;
    }
}

exports.ParseError = ParseError;
