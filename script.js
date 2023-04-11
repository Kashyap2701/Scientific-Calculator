let calculatorInput = document.getElementById("cal-input");
let display = document.getElementById("display-expression");
const digits = document.getElementsByClassName("digits")[0];
const operators = document.getElementsByClassName("operators")[0];
const calculatorButtons = document.getElementById("calculator-btns");
const mathFunctions = document.getElementById("maths-functions");
const degToRed = document.getElementById('toggle-angle');
const memoryButtons = document.getElementById('memory-buttons');
const equalButton = document.getElementById("equal-to");
const errorContainer = document.getElementById('error-container');
const flipColumn = document.getElementById('flipColumn');

const dropDown = document.getElementsByClassName('dropdown');
const dropDownItems = document.getElementsByClassName('dropdown-items');

// variable that store global value

let actualExpression = "";
let isCalculatorInputAdd = false;
let angleInDegree = true;
let memoryValue;

// define constant for PI
const PI = "\u03C0";

// ---------------------------- EVENT LISTNERER --------------------------- //

// to change the angle degree to radian
degToRed.addEventListener('click',(e)=>{
  
  if(e.target.innerText === "DEG"){
    e.target.innerText = "RAD";
    angleInDegree = false;
  }
  else{
    e.target.innerText = "DEG";
    angleInDegree=true; 
  }
})

// fixed decimal and exponential format
document.getElementById('F-E').addEventListener("click",()=>{

  if(calculatorInput.value){
    calculatorInput.value = Number(calculatorInput.value).toExponential(2);
    actualExpression += Number(calculatorInput.value) * Math.pow(10,2);
    display.value.includes("=") ? display.value = `(${calculatorInput.value })` : display.value += `(${calculatorInput.value })`;
    isCalculatorInputAdd = true;
  }

})

// Memory Fuctions 
memoryButtons.addEventListener('click',(e)=>{
  
  let curDigit = calculatorInput.value;

  if(curDigit || memoryValue == 0){

    switch(e.target.value){
      case "MS" :
        memoryValue = curDigit || 0;
        e.target.setAttribute('class','button-disable');
        e.target.parentNode.firstElementChild.removeAttribute('class');
        e.target.parentNode.firstElementChild.nextElementSibling.removeAttribute('class');
        break;
      case "MC" :
        memoryValue = 0;
        e.target.setAttribute('class','button-disable');
        e.target.parentNode.lastElementChild.removeAttribute('class');
        e.target.nextElementSibling.setAttribute('class','button-disable');
        break;
      case "M+" :
        actualExpression = `${curDigit}+${memoryValue}`;
        memoryValue = evaluatePrefix(infixToPrefix(actualExpression));
        actualExpression = "";
        break;
      case "M-" :
        actualExpression = `${curDigit}-${memoryValue}`;
        memoryValue = evaluatePrefix(infixToPrefix(actualExpression));
        actualExpression = "";
        break;
    }
  }

    switch(e.target.value){
      case "MR" :
        console.log('click');
        if(calculatorInput.value){
          const op = getLastValue(calculatorInput.value);
          if(op=="+" || op=="-" || op=="/" || op=="*" || op=="%" || op=="^" || op==PI)
            curDigit += memoryValue;
          else
            curDigit += `*${memoryValue}`;
            console.log(curDigit);
        }
        else{
          curDigit = memoryValue;
        }
        break;

      }
    calculatorInput.value = curDigit;
  
})

// Digits
digits.addEventListener("click", (e) => {

  if(e.target.tagName === "BUTTON"){
    if (e.target.value === "-" ) {
        let exp = spiltsByOperator(calculatorInput.value).slice(0,-1).join("");
        let number = spiltsByOperator(calculatorInput.value).slice(-1).join("");
        if(!isNaN(calculatorInput.value))
          calculatorInput.value = number*-1;
        else{
          if(exp.charAt(exp.length-1)=="-"){
            calculatorInput.value = `${exp.slice(0,-1)}+${number}`;
          }
          else if(exp.charAt(exp.length-1)=="+"){
            calculatorInput.value = `${exp.slice(0,-1)}${number*-1}`;
          }
          else if(number == ")" && exp.charAt(0)=="("){
            calculatorInput.value = `-${exp}${number}`;
          }
          else if(number == ")" && exp.charAt(0)=="-"){
            calculatorInput.value = `${exp.slice(1)}${number}`;
          }
          else if(!isNaN(number)){
            calculatorInput.value = `${exp}${number*-1}`;
          }
          else{
            showError('Check your expression')
          }
        }
    }
    else if(e.target.value === "."){
      calculatorInput.value += 
        calculatorInput.value.includes(".") && spiltsByOperator(calculatorInput.value).slice(-1).join("").includes(".")
         ? ''
         : e.target.value
    }
    else {
      let lastVal = getLastValue(calculatorInput.value);
      if(lastVal==")" || lastVal==PI)
        calculatorInput.value += `*${e.target.value}`;
      else
        calculatorInput.value += e.target.value;
    }
  }
  calculatorInput.focus();
});

// Operators
operators.addEventListener("click", (e) => {

  if((calculatorInput.value.includes('(') || getLastValue(calculatorInput.value)==PI) && (getLastValue(calculatorInput.value)!=')')) {
    calculatorInput.value+=e.target.value;
  }

  // equal to button is not pressed
  else if (calculatorInput.value && e.target.value !== "=") {

    if (display.value.includes("=")) {
      actualExpression = display.value = calculatorInput.value + e.target.value;
      calculatorInput.value = "";
    } 
    else {
      actualExpression +=
        isCalculatorInputAdd === false
          ? calculatorInput.value + e.target.value
          : e.target.value;
      display.value +=
        isCalculatorInputAdd === false
          ? calculatorInput.value + e.target.value
          : e.target.value;
      calculatorInput.value = "";
    }
    isCalculatorInputAdd = false;
  }
});

// Equal Button
equalButton.addEventListener("click", () => {

  if (calculatorInput.value && !display.value.includes("=")) {

    if (isCalculatorInputAdd) {
      display.value += "=";
    } 
    else {
      display.value += calculatorInput.value + "=";
      actualExpression += calculatorInput.value;
    }

    if(isBalanced(actualExpression)){  
      calculatorInput.value = evaluatePrefix(infixToPrefix(spiltsByOperator(actualExpression)));
      if(isNaN(calculatorInput.value) || calculatorInput.value==undefined){
        showError('Expression is not valid. Check it once!');
        display.value = "";
        calculatorInput.value = actualExpression;
      }
      actualExpression = "";
      isCalculatorInputAdd=false;
    }
    else{
      showError('Expression is not valid. Check it once!');
      display.value = "";
      actualExpression = "";
    }
  }

});

// Remaining Buttons
calculatorButtons.addEventListener("click", (e) => {

  if(e.target.tagName === "BUTTON"){

    let curDigit = calculatorInput.value;

    if (curDigit) {
      switch (e.target.value) {
        case "^2)":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `(${curDigit}^2)`;
          isCalculatorInputAdd = true;
          curDigit = Math.pow(curDigit, 2);
          actualExpression += curDigit;
          break;
        case "sqrt":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `sqrt(${curDigit})`;
          isCalculatorInputAdd = true;
          curDigit = Math.sqrt(curDigit);
          actualExpression += curDigit;
          break;
        case "10^":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `(10^${curDigit})`;
          isCalculatorInputAdd = true;
          curDigit = Math.pow(10, curDigit);
          actualExpression += curDigit;
          break;
        case "exp":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `(10^${curDigit})`;
          isCalculatorInputAdd = true;
          curDigit = Math.pow(10, curDigit);
          actualExpression += curDigit;
          break;
        case "log(":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `log(${curDigit})`;
          isCalculatorInputAdd = true;
          curDigit = Math.log10(curDigit);
          actualExpression += curDigit;
          break;
        case "ln(":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `ln(${curDigit})`;
          isCalculatorInputAdd = true;
          curDigit = Math.log(curDigit);
          actualExpression += curDigit;
          break;
        case "x^y":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `${curDigit}^`;
          actualExpression += curDigit + "^";
          curDigit = "";
          break;
        case "!":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `fact(${curDigit})`;
          isCalculatorInputAdd = true;
          curDigit = fact(parseInt(curDigit));
          actualExpression += curDigit;
          break;
        case "1/":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `(1/${curDigit})`;
          isCalculatorInputAdd = true;
          curDigit = 1 / curDigit;
          actualExpression += curDigit;
          break;
        case "|":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `|${curDigit}|`;
          isCalculatorInputAdd = true;
          curDigit = curDigit[0] == "-" ? curDigit.slice(1) : curDigit;
          actualExpression += curDigit;
          break;
        case "^3":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `(${curDigit}^3)`;
          isCalculatorInputAdd = true;
          curDigit = Math.pow(curDigit, 3);
          actualExpression += curDigit;
          break;
        case "cbrt":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `cbrt(${curDigit})`;
          isCalculatorInputAdd = true;
          curDigit = Math.cbrt(curDigit);
          actualExpression += curDigit;
          break;
        case "yrootx":
          if (display.value.includes("=")) {
            display.value = "";
          }
          curDigit = `${curDigit}^(1/`;
          isCalculatorInputAdd = false;
          break;
        case "e^x":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `(e^${curDigit})`;
          isCalculatorInputAdd = true;
          curDigit = Math.pow(Math.E, curDigit);
          actualExpression += curDigit;
          break;
        case "2^":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `(2^${curDigit})`;
          isCalculatorInputAdd = true;
          curDigit = Math.pow(2, curDigit);
          actualExpression += curDigit;
          break;
        case "log(x,2)":
          if (display.value.includes("=")) {
            display.value = "";
          }
          display.value += `log(${curDigit},2)`;
          isCalculatorInputAdd = true;
          curDigit = Math.log2(curDigit);
          actualExpression += curDigit;
          break;
      }
    }
    switch (e.target.value) {
      case "e":
        let expConst = 2.718281828459045.toFixed(3);
        curDigit && (!isNaN(getLastValue(curDigit))) || getLastValue(curDigit)==PI || getLastValue(curDigit)=="e"
           ? curDigit += `*${expConst}`
           : curDigit += expConst;
        break;
      case "pi":
        let pi = e.target.getAttribute('data-pi');
        curDigit && (!isNaN(getLastValue(curDigit))) || getLastValue(curDigit)==PI || getLastValue(curDigit)=="e"
           ? curDigit += `*${PI}`
           : curDigit += PI;
        break;
      case "(":
        curDigit && ((!isNaN(getLastValue(curDigit))) || getLastValue(curDigit)==")")
          ? curDigit += `*${e.target.value}`
          : curDigit += e.target.value;
        break;
      case ")":
        if(curDigit.includes('('))
          curDigit += e.target.value;
        break;
    }
    calculatorInput.value = curDigit;
  }
});

// when "2nd" button is click it flip the column
flipColumn.addEventListener('click',(e)=>{
  e.target.classList.toggle('color-blue');
  let first = document.getElementById("visible-column");
  let second = document.getElementById("hidden-column");
  first.id = "hidden-column";
  second.id = "visible-column";
});


// ---------------------------- UTILITY FUNCTION --------------------------- //


// get Last Value of Calculator Input
function getLastValue(expression){
  return spiltsByOperator(expression).slice(-1);
}

// to show error 
function showError(errorMessage){
  errorContainer.style.display = 'flex';
  errorContainer.firstElementChild.innerText = errorMessage;
  setTimeout(() => {
    errorContainer.style.display = 'none';
  }, 3000);
}

// toggle DropDown 
for(let i=0;i<dropDown.length;i++){
  dropDown[i].addEventListener('click',toggleDropDown);
}
function toggleDropDown(e) {
  if(e.target.tagName=='BUTTON')
  e.target.nextElementSibling.style.display == "none"
    ? (e.target.nextElementSibling.style.display = "flex") 
    : (e.target.nextElementSibling.style.display = "none");
}

// Trigonometry Functions and Maths Functions
for(let i=0;i<dropDownItems.length;i++){
  dropDownItems[i].addEventListener('click',utilityDropdownFunctions);
}
function utilityDropdownFunctions(e){
  let target = ['sin','cos','tan','cot','sec','cosec','ceil','floor','abs'];
  let operator = ['+','-','=','%','^',"*","/"];
  let angleValue = angleInDegree ? calculatorInput.value : evaluatePrefix(infixToPrefix(spiltsByOperator(calculatorInput.value)));
  let curDigit = calculatorInput.value;
  
  if (curDigit) {

    // if event target include the valid target
    if(target.includes(e.target.value))
    {
      // if display value doesn't contain equal
      if (display.value && !operator.some((op)=>display.value.includes(op)))
        // eg. sin(cos(9)) is possible
        display.value = `${e.target.value}(${display.value})`;
      else if(display.value.includes("=")){
        display.value = `${e.target.value}(${curDigit})`;
      }
      else 
        display.value += `${e.target.value}(${curDigit})`;
    }

    switch (e.target.value) {
      case "sin":
        curDigit = angleInDegree ? Math.sin(angleValue * (3.1415926 / 180)).toFixed(5) : Math.sin(angleValue).toFixed(5);
        break;
      case "cos":
        curDigit = angleInDegree ? Math.cos(angleValue * (3.1415926 / 180)).toFixed(5) : Math.cos(angleValue).toFixed(5);
        break;
      case "tan":
        curDigit = angleInDegree ? Math.tan(angleValue * (3.1415926 / 180)).toFixed(5) : Math.tan(angleValue).toFixed(5);
        break;
      case "cot":
        curDigit = angleInDegree ? (1 / Math.tan(angleValue * (3.1415926 / 180))).toFixed(5) : (1 / Math.tan(angleValue)).toFixed(5);
        break;
      case "sec":
        curDigit = angleInDegree ? (1 / Math.cos(angleValue * (3.1415926 / 180))).toFixed(5) : (1 / Math.cos(angleValue)).toFixed(5);
        break;
      case "cosec":
        curDigit = angleInDegree ? (1 / Math.sin(angleValue * (3.1415926 / 180))).toFixed(5) : (1 / Math.cos(angleValue)).toFixed(5);
        break;
      case "ceil":
        curDigit = Math.ceil(curDigit);
        break;
      case "floor":
        curDigit = Math.floor(curDigit);
        break;
      case "abs":
        curDigit = Math.abs(curDigit);
        break;
    }
    actualExpression += curDigit;
    isCalculatorInputAdd = true;
    calculatorInput.value = curDigit;
  }
}

// Clear all the input
function clearInput() {
  calculatorInput.value = "";
  display.value = "";
  actualExpression = "";
}

// Clear Only Last Input from Current Display
function clearLastInput() {
  calculatorInput.value = calculatorInput.value.slice(0, -1);
}

// Find the Fectorial Number
function fact(number) {
  let fact = 1;
  for (let i = number; i >= 1; i--) {
    fact = fact * i;
  }
  return fact;
}

// Precedence of Operator
function precedence(operator) {
  if (operator === "+" || operator === "-") {
    return 1;
  } else if (operator === "*" || operator === "/" || operator === "%") {
    return 2;
  } else if (operator === "^") {
    return 3;
  } else {
    return 0;
  }
}

// To Convert Expression From Infix to Prefix
function infixToPrefix(expression) {
  expression = spiltsByOperator(expression).reverse();

  // Create an empty stack and an empty result string
  let stack = [];
  let result = "";

  for (let i = 0; i < expression.length; i++) {
    let c = expression[i];
    let n = expression[i];
    if (c.match(/[a-z0-9]/i)) {
      result += c + " ";
    } else if (c === ")") {
      stack.push(c);
    }
    else if (c === PI){
      result += Math.PI + " ";
    }
     else if (
      c === "+" ||
      c === "-" ||
      c === "*" ||
      c === "/" ||
      c === "(" ||
      c === "%" ||
      c === "^" 
    ) {
        while (
          stack.length > 0 &&
          stack[stack.length - 1] !== ")" &&
          precedence(c) < precedence(stack[stack.length - 1])
        ) {
          result += stack.pop() + " ";
        }
        if (c === ")") {
          stack.pop();
        } else {
          stack.push(c);
        }
    }
  }

  while (stack.length > 0) {
    result += stack.pop() + " ";
  }

  return result.split(" ").slice(0, -1).reverse().join(" ");
}

// Evalute Prefix Expression
function evaluatePrefix(expression) {
  let tokens = expression.split(" ");

  let stack = [];

  for (let i = tokens.length - 1; i >= 0; i--) {
    let token = tokens[i];

    if (token.match(/[0-9]/i)) {
      stack.push(parseFloat(token));
    } 
    else if(token.match(PI)){
      stack.push(Math.PI);
    }  
    else if (
      token === "+" ||
      token === "-" ||
      token === "*" ||
      token === "/" ||
      token === "%" ||
      token === "^"
    ) {
      let operand1 = stack.pop();
      let operand2 = stack.pop();
      let result;
      switch (token) {
        case "+":
          result = operand1 + operand2;
          break;
        case "-":
          if(operand1 && operand2)
            result = operand1 - operand2;
          else
            result = operand1*-1;
          break;
        case "*":
          result = operand1 * operand2;
          break;
        case "/":
          result = operand1 / operand2;
          break;
        case "%":
          result = operand1 % operand2;
          break;
        case "^":
          result = Math.pow(operand1, operand2);
      }
      stack.push(result);
    }
  }
  return stack.pop();
}

// divide the expression Using Operator
function spiltsByOperator(expression) {
  
  const operators = ["+", "*", "-", "/", "(", ")", "%", "^",PI];

  let curToken = ""; 

  const tokens = [];

  for (let i = 0; i < expression.length; i++) {

    const char = expression[i];

    if (operators.includes(char)) {

      if (curToken !== "") {
        tokens.push(curToken); 
        curToken = ""; 
      }
      tokens.push(char);

    } 
    else {
      curToken += char; 
      if (i === expression.length - 1) {
        tokens.push(curToken); 
      }
    }
  }

  // now seprate the negative value in expression
  for (let i=0;i<tokens.length;i++) {

    // if part is "-" symbol
    if (tokens[i] == "-") {
      
      if (
        (i == 0 && tokens[i + 1] != "(") ||
        tokens[i - 1] == "(" ||
        (isNaN(tokens[i - 1]) && tokens[i - 1] != ")")
      ) {
        let x = tokens[i];
        let y = tokens[Number(i) + 1];
        let temp = x + y;
        tokens.splice(i, 2, temp);
       
      }
      if(tokens[i]=="-(")
      {
        tokens.splice(i,1,"-","(");
      }
    }
  }
  return tokens;
}

function isBalanced(str) {
  const stack = [];

  // Iterate over each character in the string
  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    // If the character is an opening parenthesis, push it onto the stack
    if (char === '(') {
      stack.push(char);
    }
    // If the character is a closing parenthesis, pop the last opening parenthesis from the stack
    else if (char === ')') {
      if (stack.length === 0) {
        return false; // Stack is empty, no opening parenthesis to match
      } else {
        stack.pop();
      }
    }
    // Ignore all other characters
  }

  // If the stack is empty, all parentheses are balanced
  return stack.length === 0;
}
