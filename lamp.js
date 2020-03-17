const fs = require('fs');
const er = require('./errors/errorReporter.js');
const lexer = require('./frontend/lexer.js');
const parser = require('./frontend/parser.js');
const Resolver = require('./frontend/resolver.js');
const Interpreter = require('./backend/interpreter.js');

const args = process.argv.slice(2);
const fileName = args[0];
const program = fs.readFileSync(fileName, "utf-8");

const tokens = lexer.scan(program);
if (!er.hasError()) {
    const statList = parser.parse(tokens);
    const hopTable = new Map();

    if (!er.hasError()) {
        const resolver = new Resolver(hopTable);
        resolver.start(statList);
    }
    if (!er.hasError()) {
        const interpreter = new Interpreter(statList, hopTable);
        interpreter.interpret();
    }
}
