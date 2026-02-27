class Calculator {
  constructor() {
    this.currentValue = "0";
    this.previousValue = "";
    this.operator = null;
    this.expression = "";
    this.openParens = 0;
    this.resetResultScreen = false;
    this.angleMode = "deg";
    this.feMode = false;
  }

  toRad(val) {
    return this.angleMode === "deg" ? (val * Math.PI) / 180 : val;
  }

  fromRad(val) {
    return this.angleMode === "deg" ? (val * 180) / Math.PI : val;
  }

  getOperatorSymbol(op) {
    switch (op) {
      case "*":
        return "x";
      case "/":
        return "÷";
      default:
        return op;
    }
  }

  updateResultDisplay() {
    document.getElementById("result").innerText = this.currentValue;
  }

  appendDigit(digit) {
    if (this.currentValue === "0" || this.resetResultScreen) {
      this.currentValue = digit;
      this.resetResultScreen = false;
    } else {
      this.currentValue += digit;
    }
    this.updateResultDisplay();
  }

  addDecimal() {
    if (this.resetResultScreen) {
      this.currentValue = "0";
      this.resetResultScreen = false;
    }
    if (!this.currentValue.includes(".")) this.currentValue += ".";
    this.updateResultDisplay();
  }

  setOperator(op) {
    const sym = this.getOperatorSymbol(op);
    const isScientific = calcCurMode.getMode() === "scientific";

    if (this.openParens > 0) {
      if (this.resetResultScreen) {
        this.expression =
          this.expression.trimEnd().replace(/[+\-x÷^%]+$/, "") +
          " " +
          sym +
          " ";
      } else {
        this.expression += this.currentValue + " " + sym + " ";
      }
      this.operator = op;
      this.resetResultScreen = true;
      document.getElementById("lastResult").textContent = this.expression;
      return;
    }

    if (!isScientific) {
      if (this.operator && !this.resetResultScreen) this.calculate();
      this.previousValue = this.currentValue;
      this.expression =
        this.expression === ""
          ? this.currentValue + " " + sym + " "
          : this.expression + this.currentValue + " " + sym + " ";
    } else {
      if (this.resetResultScreen && this.expression !== "") {
        this.expression =
          this.expression.trimEnd().replace(/[+\-x÷^%]+$/, "") +
          " " +
          sym +
          " ";
      } else {
        this.expression =
          this.expression === ""
            ? this.currentValue + " " + sym + " "
            : this.expression + this.currentValue + " " + sym + " ";
      }
      this.previousValue = this.currentValue;
    }

    this.operator = op;
    this.resetResultScreen = true;
    document.getElementById("lastResult").textContent = this.expression;
  }

  calculate() {
    if (
      this.resetResultScreen &&
      this.operator &&
      this.previousValue !== "" &&
      this.expression === ""
    ) {
      this.currentValue = this.previousValue;
      this.resetResultScreen = false;
    }

    let fullExpression;
    if (this.expression !== "") {
      fullExpression = this.resetResultScreen
        ? this.expression
        : this.expression + this.currentValue;
      if (this.openParens > 0) fullExpression += ")".repeat(this.openParens);
    } else {
      if (!this.operator || !this.previousValue) return;
      fullExpression = `${this.previousValue} ${this.operator} ${this.currentValue}`;
    }

    const result = this.evaluateExpression(fullExpression);
    HistoryManager.save(fullExpression + " =", String(result));
    document.getElementById("lastResult").textContent = fullExpression + " =";
    this.currentValue = String(result);
    this.operator = null;
    this.previousValue = "";
    this.expression = "";
    this.openParens = 0;
    this.resetResultScreen = true;
    this.updateResultDisplay();
  }

  evaluateExpression(expr) {
    const precedence = {
      "+": 1,
      "-": 1,
      x: 2,
      "*": 2,
      "÷": 2,
      "/": 2,
      "^": 3,
      "%": 2,
    };

    const applyOp = (nums, op) => {
      const b = nums.pop();
      const a = nums.pop();
      switch (op) {
        case "+":
          return a + b;
        case "-":
          return a - b;
        case "x":
        case "*":
          return a * b;
        case "÷":
        case "/":
          return b === 0 ? "Error" : a / b;
        case "^":
          return Math.pow(a, b);
        case "%":
          return a % b;
      }
    };

    const numStack = [];
    const opStack = [];

    const parts = expr.trim().match(/\d+\.?\d*|[+\-x÷^%()]/g);

    for (let part of parts) {
      if (!isNaN(part)) {
        numStack.push(parseFloat(part));
      } else if (part === "(") {
        opStack.push("(");
      } else if (part === ")") {
        while (opStack.length && opStack.at(-1) !== "(") {
          numStack.push(applyOp(numStack, opStack.pop()));
        }
        opStack.pop();
      } else if (precedence[part] !== undefined) {
        while (
          opStack.length &&
          opStack.at(-1) !== "(" &&
          precedence[opStack.at(-1)] >= precedence[part]
        ) {
          const res = applyOp(numStack, opStack.pop());
          if (res === "Error") return "Error";
          numStack.push(res);
        }
        opStack.push(part);
      }
    }

    while (opStack.length) {
      const res = applyOp(numStack, opStack.pop());
      if (res === "Error") return "Error";
      numStack.push(res);
    }

    const final = numStack[0];
    return isFinite(final) ? final : "Error";
  }

  clearAll() {
    this.currentValue = "0";
    this.previousValue = "";
    this.operator = null;
    this.expression = "";
    this.openParens = 0;
    this.resetResultScreen = false;
    document.getElementById("lastResult").innerHTML = "&nbsp;";
    this.updateResultDisplay();
  }

  clearEntry() {
    this.currentValue = "0";
    this.updateResultDisplay();
  }

  deleteLast() {
    this.currentValue =
      this.currentValue.length > 1 ? this.currentValue.slice(0, -1) : "0";
    this.updateResultDisplay();
  }

  negate() {
    this.currentValue = String(parseFloat(this.currentValue) * -1);
    this.updateResultDisplay();
  }

  percent() {
    this.currentValue = String(parseFloat(this.currentValue) / 100);
    this.updateResultDisplay();
  }

  reciprocal() {
    this.currentValue = String(1 / parseFloat(this.currentValue));
    this.updateResultDisplay();
  }

  square() {
    this.currentValue = String(Math.pow(parseFloat(this.currentValue), 2));
    this.updateResultDisplay();
  }

  cube() {
    this.currentValue = String(Math.pow(parseFloat(this.currentValue), 3));
    this.updateResultDisplay();
  }

  sqrt() {
    this.currentValue = String(Math.sqrt(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }

  cbrt() {
    this.currentValue = String(Math.cbrt(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }

  log10() {
    this.currentValue = String(Math.log10(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }

  ln() {
    this.currentValue = String(Math.log(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }

  absolute() {
    this.currentValue = String(Math.abs(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }

  factorial() {
    let n = parseInt(this.currentValue);
    if (n < 0) {
      this.currentValue = "Error";
      this.updateResultDisplay();
      return;
    }
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    this.currentValue = String(result);
    this.updateResultDisplay();
  }

  setPower() {
    this.setOperator("^");
  }
  setMod() {
    this.setOperator("%");
  }

  insertPi() {
    this.currentValue = String(Math.PI);
    this.updateResultDisplay();
  }

  insertE() {
    this.currentValue = String(Math.E);
    this.updateResultDisplay();
  }

  epow() {
    this.currentValue = String(Math.pow(Math.E, parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }

  pow10() {
    this.currentValue = String(Math.pow(10, parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }

  pow2() {
    this.currentValue = String(Math.pow(2, parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }

  toggleDeg() {
    this.angleMode = this.angleMode === "deg" ? "rad" : "deg";
    document.getElementById("degBtn").textContent =
      this.angleMode.toUpperCase();
  }

  toggleFE() {
    this.feMode = !this.feMode;
    this.currentValue = this.feMode
      ? parseFloat(this.currentValue).toExponential()
      : String(parseFloat(this.currentValue));
    this.updateResultDisplay();
  }

  sin() {
    this.currentValue = String(
      Math.sin(this.toRad(parseFloat(this.currentValue))),
    );
    this.updateResultDisplay();
  }
  cos() {
    this.currentValue = String(
      Math.cos(this.toRad(parseFloat(this.currentValue))),
    );
    this.updateResultDisplay();
  }
  tan() {
    this.currentValue = String(
      Math.tan(this.toRad(parseFloat(this.currentValue))),
    );
    this.updateResultDisplay();
  }
  csc() {
    this.currentValue = String(
      1 / Math.sin(this.toRad(parseFloat(this.currentValue))),
    );
    this.updateResultDisplay();
  }
  sec() {
    this.currentValue = String(
      1 / Math.cos(this.toRad(parseFloat(this.currentValue))),
    );
    this.updateResultDisplay();
  }
  cot() {
    this.currentValue = String(
      1 / Math.tan(this.toRad(parseFloat(this.currentValue))),
    );
    this.updateResultDisplay();
  }

  asin() {
    this.currentValue = String(
      this.fromRad(Math.asin(parseFloat(this.currentValue))),
    );
    this.updateResultDisplay();
  }
  acos() {
    this.currentValue = String(
      this.fromRad(Math.acos(parseFloat(this.currentValue))),
    );
    this.updateResultDisplay();
  }
  atan() {
    this.currentValue = String(
      this.fromRad(Math.atan(parseFloat(this.currentValue))),
    );
    this.updateResultDisplay();
  }
  acsc() {
    this.currentValue = String(
      this.fromRad(Math.asin(1 / parseFloat(this.currentValue))),
    );
    this.updateResultDisplay();
  }
  asec() {
    this.currentValue = String(
      this.fromRad(Math.acos(1 / parseFloat(this.currentValue))),
    );
    this.updateResultDisplay();
  }
  acot() {
    this.currentValue = String(
      this.fromRad(Math.atan(1 / parseFloat(this.currentValue))),
    );
    this.updateResultDisplay();
  }

  sinh() {
    this.currentValue = String(Math.sinh(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }
  cosh() {
    this.currentValue = String(Math.cosh(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }
  tanh() {
    this.currentValue = String(Math.tanh(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }
  csch() {
    this.currentValue = String(1 / Math.sinh(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }
  sech() {
    this.currentValue = String(1 / Math.cosh(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }
  coth() {
    this.currentValue = String(1 / Math.tanh(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }

  asinh() {
    this.currentValue = String(Math.asinh(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }
  acosh() {
    this.currentValue = String(Math.acosh(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }
  atanh() {
    this.currentValue = String(Math.atanh(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }
  acsch() {
    this.currentValue = String(Math.asinh(1 / parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }
  asech() {
    this.currentValue = String(Math.acosh(1 / parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }
  acoth() {
    this.currentValue = String(Math.atanh(1 / parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }

  floor() {
    this.currentValue = String(Math.floor(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }
  ceil() {
    this.currentValue = String(Math.ceil(parseFloat(this.currentValue)));
    this.updateResultDisplay();
  }
  rand() {
    this.currentValue = String(Math.random());
    this.updateResultDisplay();
  }

  dms() {
    const decimal = parseFloat(this.currentValue);
    const degrees = Math.floor(decimal);
    const minutes = Math.floor((decimal - degrees) * 60);
    const seconds = ((decimal - degrees) * 60 - minutes) * 60;
    this.currentValue = `${degrees}° ${minutes}' ${seconds.toFixed(2)}"`;
    document.getElementById("result").textContent = this.currentValue;
  }

  degConvert() {
    this.currentValue = String(parseFloat(this.currentValue) * (180 / Math.PI));
    this.updateResultDisplay();
  }

  openParen() {
    if (this.resetResultScreen || this.expression === "") {
      this.expression += "(";
    } else {
      this.expression += this.currentValue + "*(";
    }
    this.openParens++;
    this.currentValue = "0";
    this.resetResultScreen = true;
    document.getElementById("lastResult").textContent = this.expression;
    this.updateResultDisplay();
  }

  closeParen() {
    if (this.openParens > 0) {
      this.expression += this.currentValue + ")";
      this.openParens--;
      document.getElementById("lastResult").textContent = this.expression;
      this.resetResultScreen = true;
      this.updateResultDisplay();
    }
  }
}

Calculator.prototype.add = function () {
  this.setOperator("+");
};
Calculator.prototype.subtract = function () {
  this.setOperator("-");
};
Calculator.prototype.multiply = function () {
  this.setOperator("*");
};
Calculator.prototype.divide = function () {
  this.setOperator("/");
};
