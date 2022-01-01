/*Variable global for state*/
var showingResult = false;
var openBracketTotal = 0;
var hasPoint = false;
var curNumisNull = true;

/*String function, because string is immutable..*/
function replaceAt(index, replacement, strVal) {
    return strVal.substring(0, index) + replacement + strVal.substring(index + replacement.length);
}

/*HTML-CSS FUNCTION*/
function getHistory(){
    return document.getElementById("history-value").textContent;
}

function getOutput(){
    return document.getElementById("output-value").textContent;
}

function updateHistory(str){
    var output = document.getElementById("history-value");
    var len = str.length;
    var size = "1.25rem";
    if(len > 23)size=resizeFontHistory(len);
    if(len > 31)str = str.substring(0, str.length-3)+"...";
    
    output.style.fontSize = size;
    output.textContent = str;
}

function updateOutput(num){
    var output = document.getElementById("output-value");
    var len = String(num).length;
    var size = "3rem";
    if(len > 8)size = resizeFontOutput(len);
    
    output.textContent = num;
    output.style.fontSize = size;
}

function resizeFontOutput(x){
    // using math and statictic
    var result = String(0.00325*x*x - 0.20881*x + 4.20914);
    result += "rem";
    return result;
}

function resizeFontHistory(x){
    var result = String(0.00285714*x*x-0.200286*x+4.42314);
    result += "rem";
    return result;
}

/*Math operator function*/
function operatorWeight(op){
    if(op=="^")return 4;
    if(op=="*" || op=="/" || op=="%")return 2;
    if(op=="+" || op=="-")return 1;
}

function isNum(x){return !isNaN(x);}
function isOperand(x){return isNum(x) || x=='.'};
function isLetter(x){return (x >='A' && x <= 'Z') || (x >= 'a' && x <= 'z');}
function isOperator(x){return !isOperand(x) && !isLetter(x)};
function isNonBracketOperator(x){return isOperator(x) && x != ")" && x != "("};
function isEmpty(st){return st.length == 0};
function isRightAssociative(op){return op=="^"};
function isNotValidToAdd(lastChar, num){
    return isLetter(lastChar) || 
           (hasPoint && num==".") ||  
           (curNumisNull && lastChar=="0" && (num=="0" || num=="00"));
}

//Check wether op1 has higher precedence
function hasHigherPrecedence(op1, op2){
    let w1 = operatorWeight(op1);
    let w2 = operatorWeight(op2);
    alert(op1+" "+w1);
    alert(op2+" "+w2);
    if(w1==w2){
        if(isRightAssociative(op1))return false;
        return true;
    }
    return w1 > w2;
}

function infixToPostfix(equation){
    let stacc = [];
    let result = "";
    //scan from left to right
    let len = equation.length;
    let lastActOut = false;
    for(let i = 0;i < len;i++){
        let ct = equation[i];
        //if is a operand, save it
        if(isOperand(ct)){
            result += ct;
            lastActOut=true;
        }else if(ct == '('){
            stacc.push('(');
            lastActOut=false;
        }else if(ct == ')'){
            if(lastActOut){
                result+=",";
                lastActOut=false;
            }
            //remove all elements in the stack until '(' and save it
            while(!isEmpty(stacc) && stacc[stacc.length-1] != '('){
                result += stacc[stacc.length-1];
                result+=",";
                stacc.pop();
            }
            stacc.pop();
        }
        else{
            //ct is operator, append comma
            if(lastActOut){
                result+=",";
                lastActOut=false;
            }
            if(ct=="-"){
                if(equation[i-1]==undefined || equation[i-1]=="("){
                    result+="-";
                    result+=equation[i+1];
                    i++;
                    result+=",";
                    continue;
                }
            }

            while(!isEmpty(stacc) && stacc[stacc.length-1] != '(' && hasHigherPrecedence(stacc[stacc.length-1], ct)){
                result+=stacc[stacc.length-1];
                result+=",";
                stacc.pop();
            }
            stacc.push(ct);
            lastActOut=false;
        }
    }
    while(!isEmpty(stacc)){
        if(lastActOut){
            result+=",";
            //just to be safe sir
            lastActOut=false;
        }
        result+=stacc[stacc.length-1];
        stacc.pop();
        lastActOut=true;
    }
    return result;
}

function doMath(a, b, operator){
    a = Number(a);
    b = Number(b);
    let result;
    switch(operator){
        case "*":
            result = a*b;
            break;
        case "/":
            result = a/b;
            break;
        case "+":
            result = a+b;
            break;
        case "-":
            result = a-b;
            break;
        case "%":
            result = a%b;
            break;
        case "^":
            result = a**b;
            break;
        default:
            alert("something wrong");
            result = NaN;
            break;
    }
    // console.log("result: "+result);
    return result;
}

function evaluate(equation){
    //equation is infix, translate to postfix
    equation = infixToPostfix(equation);
    //pecah per elemendo
    let splitEqu = equation.split(",");
    let len = splitEqu.length;
    // console.log("infix: "+equation);
    let operandStack = [];
    // console.log("splitted");
    //Linear scan
    for(let i = 0;i<len;i++){
        // console.log("-"+splitEqu[i]+"-");
        //jaga-jaga
        if(splitEqu[i]==" " || splitEqu==""){
            alert("something wrong");
            continue;
        }
        else if(isNum(splitEqu[i])){
            operandStack.push(splitEqu[i]);
        }else{
            //is an operator
            let second = operandStack[operandStack.length-1];
            operandStack.pop();
            let first = operandStack[operandStack.length-1];
            operandStack.pop();
            let result = doMath(first, second, splitEqu[i]);
            operandStack.push(result);
        }
    }
    //final number on stack is the answer
    return operandStack[operandStack.length-1];
}

function equal(){
    let infixEquationQue = getOutput();
    let lastChar = infixEquationQue[infixEquationQue.length-1];
    // alert("call equ");
    if(showingResult || openBracketTotal > 0 || isNonBracketOperator(lastChar))return;

    updateHistory(infixEquationQue+"=");
    let answer = evaluate(infixEquationQue);
    // alert(answer);
    updateOutput(answer);
    showingResult=true;
}
/*Start of non equal operator */
function updateTotalBracket(lastChar){
    if(lastChar=='(')openBracketTotal--;
    else if(lastChar==')')openBracketTotal++;
}

function updatePoint(equation){
    //linear scan aja dah boy
    let len = equation.length;
    hasPoint=false;
    //scan sampe ketemu point or operator
    for(let i = len-1;i>-1 && !isOperator(equation[i]) && !hasPoint;i--){
        hasPoint=equation[i]==".";
    }
}

function operatorUtil(opChar){
    let inputVal = getOutput();
    let lastChar = inputVal[inputVal.length-1];
    if(isLetter(lastChar))return;
    //spesific case
    if((lastChar=="(" && opChar=="-") || !isOperator(lastChar) || lastChar==")"){
        inputVal+=opChar;
    }
    else{
        //if replacing resulting in double operand, then no unless the before is )
        if(isOperator(inputVal[inputVal.length-2]) && inputVal[inputVal.length-2]!=")")return;
        //replace it with this operator
        inputVal = replaceAt(inputVal.length-1, opChar, inputVal);
        //if we replace an open or close
        updateTotalBracket(lastChar);
    }
    updatePoint(inputVal);
    updateOutput(inputVal);
    showingResult=false;
    curNumisNull=true;
}

function addNumber(num){
    let inputVal = getOutput();
    let lastChar = inputVal[inputVal.length-1];
    
    //case where adding number doesnt work
    if(isNotValidToAdd(lastChar, num))return;
    if(showingResult){
        showingResult=false;
        curNumisNull=true;
        inputVal="";
    }
    if(curNumisNull){
        if(num=="00")num="0";
        if(lastChar=="0" && num!="."){
            inputVal = replaceAt(inputVal.length-1, num, inputVal);
            updateOutput(inputVal);
            curNumisNull=num=="0";
            return;
        }
        curNumisNull=num=="0";
    }
    if(lastChar==')')inputVal+="*";
    inputVal+=num;
    updateOutput(inputVal);
}

function power(){
    operatorUtil("^");
}

function clearEntry(){
    let inputVal = getOutput();
    let lastChar = inputVal[inputVal.length-1];
    // alert(showingResult);
    if(isLetter(lastChar) || showingResult){
        clearAll();
        return;
    }
    inputVal = inputVal.substring(0, inputVal.length-1);
    updateTotalBracket(lastChar);
    if(inputVal.length==0){inputVal="0";curNumisNull=true;}
    updatePoint(inputVal);
    updateOutput(inputVal);
}

function clearAll(){
    updateHistory("");
    updateOutput("0");
    openBracketTotal=0;
    hasPoint=false;
    showingResult=false;
    curNumisNull=true;
}

function mod(){
    operatorUtil("%");
}

function sqrtOp(){
    operatorUtil("^(0.5)");
}

function openBracket(){
    let inputVal = getOutput();
    let lastChar = inputVal[inputVal.length-1];
    if(isLetter(lastChar))return;
    if(isOperand(lastChar) || lastChar==')')inputVal+="*";
    inputVal+='(';
    updateOutput(inputVal);
    openBracketTotal++;
    showingResult=false;
    curNumisNull=true;
}

function closeBracket(){
    let inputVal = getOutput();
    let lastChar = inputVal[inputVal.length-1];
    if(openBracketTotal < 1 || (isOperator(lastChar) && lastChar!=")"))return;

    inputVal+=")";
    updateOutput(inputVal);
    openBracketTotal--;
    curNumisNull=true;
    
}

function divide(){
    operatorUtil("/");
}

function multiply(){
    operatorUtil("*");
}

function minus(){
    operatorUtil("-");
}

function plus(){
    operatorUtil("+");
}

function point(){
    addNumber(".");
    hasPoint=true;
}

function main(){
    var number = document.getElementsByClassName("number");
    var total = number.length;
    for(let i = 0; i < total;i++){
        number[i].addEventListener('click', function(){
            addNumber(this.id);
        })
    }

    var operator = document.getElementsByClassName("operator");
    total = operator.length;
    for(let i = 0; i < total;i++){
        operator[i].addEventListener('click', function(){
            // alert(this.id);
            switch(this.id){
                case "power":
                    power();
                    break;
                case "clr-entry":
                    clearEntry();
                    break;
                case "clr-all":
                    clearAll();
                    break;
                case "mod":
                    mod();
                    break;
                case "sqrt":
                    sqrtOp();
                    break;
                case "open-bracket":
                    openBracket();
                    break;
                case "close-bracket":
                    closeBracket();
                    break;
                case "divide":
                    divide();
                    break;
                case "mult":
                    multiply();
                    break;
                case "minus":
                    minus();
                    break;
                case "plus":
                    plus();
                    break;
                case "point":
                    point();
                    break;
                case "equal":
                    equal();
                    break;
            }
        })
    }
}

main();