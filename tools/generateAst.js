const fs = require('fs');

const destination = '../ast';

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateAst(baseName, data) {
    let result = '';

    data.forEach(d => {
        const name = d.split(':')[0].trim();
        const paramsArray = d.split(':')[1].trim();
        const params = paramsArray.split(',').map(p => p.trim());
        result = result + generateConstructor(baseName, name, params) + '\n\n';
    });

    return result;
}

function generateConstructor(baseName, name, params) {
    const capBase = capitalize(baseName);
    const capName = capitalize(name);
    let result = `exports.${capName} = class {\n`;
    result += `    constructor(${params.join(', ')}) {\n`;
    params.forEach(p => result += `        this.${p} = ${p};\n`);
    result += `    }\n\n`;
    result += `    accept(visitor) {\n`;
    result += `        return visitor.visit${capName}${capBase}(this);\n`;
    result += `    }\n`;
    result += `}`;
    return result;
}

function generateFileAst(destination, baseName, ...data) {
    fs.writeFile(`${destination}/${baseName}.js`, generateAst(baseName, data));
}

generateFileAst(destination, 'expr',
'binary: left, operator, right',
'unary: operator, right',
'literal: value',
'grouping: expression',
'ternary: first, second, third',
'logical: left, operator, right', // because short circuit
'variable: token',
'assign: assigned, expression',
'array: exprList',
'map: exprPairs',
'call: nameExpr, bracket, argList',
'indexing: nameExpr, bracket, expression',
'setIndex: assigned, expression');

generateFileAst(destination, 'stat',
'print: expression',
'expression: expression',
'let: identifier, expression',
'block: statList',
'if: conditionalList',
'while: condition, block',
'func: identifier, paramList, body',
'ret: token, value',
'break: token',
'continue: token');
