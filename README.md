# Lamp Programming Language
A small Python-like programming language

## Description

Lamp is a small, Python-like programming language implemented in JavaScript.
The language is dynamically typed, has built-in arrays and dictionaries, closures,
higher order functions and other language constructs.

## Goals

After I read [Crafting Interpreters](http://www.craftinginterpreters.com/), I decided I wanted to try to implement my small programming language. This language is the result of that attempt.

## Grammar

program -> statement* EOF
statement -> print | let | if | while | func |
             ret | break | continue | expressionStat  
print -> 'print' expression NEW_LINE  
let -> 'let' IDENTIFIER '=' expression NEW_LINE  
if -> 'if' expression block ('elif' expression block)* ('else' block)?  
while -> 'while' expression block  
func -> 'func' IDENTIFIER '(' paramList ')' block  
ret -> 'ret' (expression)? NEW_LINE  
break -> 'break' NEW_LINE  
continue -> 'continue' NEW_LINE  
expressionStat -> expression NEW_LINE  
block -> INDENT statement* DEDENT  

expression -> comma  
comma -> nonCommaExpr (',' nonCommaExpr)*  
nonCommaExpr -> assign  
assign -> ternary '=' expression  
ternary -> logicalSum ('?' ternary : ternary)?  
logicalSum -> and (('or' | 'xor') and)*  
and -> equal ('and' equal)*  
equal -> comparison (('==' | '!=') comparison)*  
comparison -> sum (('<' | '<=' | '>' | '>=') sum)*  
sum -> mult (('+' | '-' | '++') mult)*  
mult -> pow (('*' | '/' | '%') pow)*  
pow -> unary | unary '^' pow  
unary -> call | ('-' | '!') unary  
call -> functionCall | indexing  
functionCall -> primary '(' argList ')'  
argList -> nonCommaExpr (',' nonCommaExpr)* | ''  
indexing -> primary '[' expression ']'
primary -> STRING | NUMBER | TRUE | FALSE | NIHL   
| '(' expression ')' | IDENTIFIER | array | map  
array -> '[' arrayList ']'  
arrayList -> nonCommaExpr (',' nonCommaExpr)* | ''  
map -> '{' mapList '}'  
mapList -> mapElement (',' mapElement) | ''  
mapElement -> nonCommaExpr '=>' nonCommaExpr  

## Types

Lamp currently has 6 types:

* boolean
* number (any floating point number)
* string
* array
* map
* nihl

## Operators

Lamp currently has the following operators:

### Logical

* or (e.g. true or false)
* xor (e.g. true xor false)
* and (e.g. true and false)
* not (e.g. !true)
* ternary (e.g. true ? false : true)

### Arithmetic

* plus (e.g. 10 + 20)
* minus (e.g. 10 - 20)
* times (e.g. 10 * 3)
* division (e.g. 10 / 3)
* mod (e.g. 10 % 3)
* power (e.g. 10 ^ 3)

### Other

* concatenation (e.g [1, 2, 3] ++ [4, 5, 6]; 'hello' ++ ' world')

## Built-in functions

Lamp currently has four built-in functions:
* len(array): returns the length of an array or a string
* typeof(var): returns the type of a variable as a string
* readFile(fileName): returns the content of a file as a string (synchronous)
* writeFile(fileName, newContent): overwrites the content of a file (synchronous)
* appendFile(fileName, content): appends content to a file (synchronous)
* clock(): returns the milliseconds elapsed since January 1, 1970

## Sample Programs

## Expressions

```
@ This is a comment
print (10 > 2 ? true : nihl) xor false @ expected result: true
print (len([1, 2, 3] ++ ['asd', 'qwe']) == 5 and typeof(true) == 'boolean') xor true @ expected result: false
```

## Variable Declaration

```
let meat = 'pork' ++ 'cooked'
let map = {
    'bread' => 10,
    'garlic' => 20,
    'vitamin c' => 30,
    'list' => [meat, 'eggs', ['brot']]
}

print map
```

### Assignments

```
let meat = 'pork' ++ 'cooked'
let map = {
    'list' => [meat, 'eggs', ['brot']]
}
map['recursion'] = map
let letter = meat[2]
meat = map['list'][2]

print map
print letter
print meat
```

### Conditional Statements

```
let fizz = 30

if fizz % 15 == 0
    print 'FizzBuzz'
elif fizz % 3 == 0
    print 'Fizz'
elif fizz % 5 == 0
    print 'Buzz'
else
    print fizz
```

### Loops

```
@ For loops are not yet supported

let fizz = 1

while fizz < 100
    if fizz % 15 == 0
        print 'FizzBuzz'
    elif fizz % 3 == 0
        print 'Fizz'
    elif fizz % 5 == 0
        print 'Buzz'
    else
        print fizz
    fizz = fizz + 1
```

### Function Definition

```
func factorial(n)
    if n <= 0
        ret 1
    else
        ret n * factorial(n - 1)

print factorial(20)
```

### Closures

```
func sayHiConstructor()
    let greeting = 'Hi'

    func change(newGreeting)
        greeting = newGreeting

    func sayHi()
        print greeting

    ret {
        'change' => change,
        'sayHi' => sayHi
    }

let hiSayer = sayHiConstructor()
hiSayer['sayHi']()
hiSayer['change']('Hallo')
hiSayer['sayHi']()
```
