const calc = new Calculator();

applyStoredTheme();
renderBtnGrid();
initPopovers();
HistoryManager.render();

function handleAction(action) {
  switch (action) {
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      calc.appendDigit(action);
      break;

    case "add":
      calc.add();
      break;
    case "subtract":
      calc.subtract();
      break;
    case "multiply":
      calc.multiply();
      break;
    case "divide":
      calc.divide();
      break;

    case "equals":
      calc.calculate();
      break;
    case "clear":
      calc.clearAll();
      break;
    case "ce":
      calc.clearEntry();
      break;
    case "delete":
      calc.deleteLast();
      break;
    case "decimal":
      calc.addDecimal();
      break;
    case "negate":
      calc.negate();
      break;
    case "percent":
      calc.percent();
      break;

    case "square":
      calc.square();
      break;
    case "cube":
      calc.cube();
      break;
    case "sqrt":
      calc.sqrt();
      break;
    case "cbrt":
      calc.cbrt();
      break;
    case "reciprocal":
      calc.reciprocal();
      break;
    case "abs":
      calc.absolute();
      break;
    case "factorial":
      calc.factorial();
      break;
    case "power":
      calc.setPower();
      break;
    case "mod":
      calc.setMod();
      break;

    case "pi":
      calc.insertPi();
      break;
    case "e":
      calc.insertE();
      break;
    case "epow":
      calc.epow();
      break;
    case "10pow":
      calc.pow10();
      break;
    case "2pow":
      calc.pow2();
      break;

    case "log":
      calc.log10();
      break;
    case "ln":
      calc.ln();
      break;

    case "deg-toggle":
      calc.toggleDeg();
      break;
    case "fe-toggle":
      calc.toggleFE();
      break;
    case "exp":
      calc.toggleFE();
      break;

    case "sin":
      calc.sin();
      break;
    case "cos":
      calc.cos();
      break;
    case "tan":
      calc.tan();
      break;
    case "csc":
      calc.csc();
      break;
    case "sec":
      calc.sec();
      break;
    case "cot":
      calc.cot();
      break;
    case "asin":
      calc.asin();
      break;
    case "acos":
      calc.acos();
      break;
    case "atan":
      calc.atan();
      break;
    case "acsc":
      calc.acsc();
      break;
    case "asec":
      calc.asec();
      break;
    case "acot":
      calc.acot();
      break;

    case "sinh":
      calc.sinh();
      break;
    case "cosh":
      calc.cosh();
      break;
    case "tanh":
      calc.tanh();
      break;
    case "csch":
      calc.csch();
      break;
    case "sech":
      calc.sech();
      break;
    case "coth":
      calc.coth();
      break;
    case "asinh":
      calc.asinh();
      break;
    case "acosh":
      calc.acosh();
      break;
    case "atanh":
      calc.atanh();
      break;
    case "acsch":
      calc.acsch();
      break;
    case "asech":
      calc.asech();
      break;
    case "acoth":
      calc.acoth();
      break;

    case "floor":
      calc.floor();
      break;
    case "ceil":
      calc.ceil();
      break;
    case "rand":
      calc.rand();
      break;
    case "dms":
      calc.dms();
      break;
    case "deg":
      calc.degConvert();
      break;

    case "openParen":
      calc.openParen();
      break;
    case "closeParen":
      calc.closeParen();
      break;

    case "mc":
      MemoryManager.clear();
      break;
    case "mr":
      calc.currentValue = String(MemoryManager.recall());
      calc.updateResultDisplay();
      break;
    case "ms":
      MemoryManager.store(parseFloat(calc.currentValue));
      break;
    case "mplus":
      MemoryManager.add(parseFloat(calc.currentValue));
      break;
    case "mminus":
      MemoryManager.subtract(parseFloat(calc.currentValue));
      break;
  }
}

document.getElementById("btnGrid").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  handleAction(btn.dataset.action);
});

document.addEventListener("click", (e) => {
  const btn =
    e.target.closest(".trig-popover [data-action]") ||
    e.target.closest(".fn-popover [data-action]");
  if (!btn) return;
  handleAction(btn.dataset.action);
});

document.addEventListener("change", (e) => {
  if (e.target.matches("#hypBtn")) {
    const isThird = e.target.checked;
    const popoverEl = e.target.closest(".popover");
    if (!popoverEl) return;
    popoverEl.querySelectorAll("[data-second-trigo]").forEach((btn) => {
      btn.innerHTML = isThird ? btn.dataset.thirdLabel : btn.dataset.firstLabel;
      btn.dataset.action = isThird
        ? btn.dataset.thirdAction
        : btn.dataset.firstAction;
    });
  } else if (e.target.matches("#trigSecondBtn")) {
    const isSecond = e.target.checked;
    const popoverEl = e.target.closest(".popover");
    if (!popoverEl) return;
    popoverEl.querySelectorAll("[data-second-trigo]").forEach((btn) => {
      btn.innerHTML = isSecond
        ? btn.dataset.secondLabel
        : btn.dataset.firstLabel;
      btn.dataset.action = isSecond
        ? btn.dataset.secondAction
        : btn.dataset.firstAction;
    });
  }
});

document.querySelectorAll(".scientificControls").forEach((x) =>
  x.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    handleAction(btn.dataset.action);
  }),
);

document.getElementById("memoryOperations").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  handleAction(btn.dataset.action);
});

const calcTitle = document.getElementById("calcTitle");

document.getElementById("standardBtn").addEventListener("click", () => {
  if (calcCurMode.getMode() !== "standard") {
    calcCurMode.setMode("standard");
    calcTitle.innerText = "Standard";
    document.querySelectorAll(".scientificControls").forEach((x) => {
      x.classList.add("d-none");
      x.classList.remove("d-flex");
    });
    renderBtnGrid();
  }
  hideSidebar();
});

document.getElementById("scientificBtn").addEventListener("click", () => {
  if (calcCurMode.getMode() !== "scientific") {
    calcCurMode.setMode("scientific");
    calcTitle.innerText = "Scientific";
    document.querySelectorAll(".scientificControls").forEach((x) => {
      x.classList.remove("d-none");
      x.classList.add("d-flex");
    });
    renderBtnGrid();
  }
  hideSidebar();
});

document.getElementById("darkModeSwitch").addEventListener("change", (e) => {
  const html = document.querySelector("html");
  const trigoLogo = document.getElementById("trigoLogo");
  const fnLogo = document.getElementById("fnLogo");

  if (e.target.checked) {
    html.setAttribute("data-bs-theme", "dark");
    trigoLogo.setAttribute("fill", "#FFFF");
    fnLogo.setAttribute("fill", "#FFFF");
    localStorage.setItem("calcTheme", "dark");
  } else {
    html.setAttribute("data-bs-theme", "light");
    trigoLogo.setAttribute("fill", "#000000");
    fnLogo.setAttribute("fill", "#000000");
    localStorage.setItem("calcTheme", "light");
  }
});

const optionHistory = document.getElementById("optionHistory");
const optionMemory = document.getElementById("optionMemory");
optionHistory.checked = true;
HistoryManager.render();

document.getElementById("historyOptions").addEventListener("click", () => {
  if (optionHistory.checked) {
    HistoryManager.render();
  } else if (optionMemory.checked) {
    MemoryManager.render();
  }
});

document.getElementById("history").addEventListener("click", (e) => {
  if (optionHistory.checked) {
    const item = e.target.closest(".history-item");
    if (!item) return;
    calc.currentValue = item.dataset.result;
    document.getElementById("lastResult").innerText = item.dataset.expression;
  } else if (optionMemory.checked) {
    const item = e.target.closest(".memory-item");
    if (!item) return;
    calc.currentValue = item.dataset.result;
  }
  calc.updateResultDisplay();
});

document.getElementById("trashBtn").addEventListener("click", () => {
  document.querySelector(".modal-body").innerText = optionHistory.checked
    ? "Are you sure you want to clear the history?"
    : "Are you sure you want to clear the memory?";
});

document.getElementById("modalConfirmBtn").addEventListener("click", () => {
  if (optionHistory.checked) {
    HistoryManager.clear();
  } else if (optionMemory.checked) {
    MemoryManager.clear();
  }
  bootstrap.Modal.getInstance(
    document.getElementById("clearStorageModal"),
  ).hide();
});

document.addEventListener("keydown", (e) => {
  if (document.querySelector(".offcanvas.show")) return;
  if (document.querySelector(".modal.show")) return;

  const prevented = ["Enter", "/", "Escape"];
  if (prevented.includes(e.key)) e.preventDefault();

  const keyMap = {
    "+": "add",
    "-": "subtract",
    "*": "multiply",
    "/": "divide",
    "%": "percent",
    "^": "power",
    "=": "equals",
    Enter: "equals",
    ".": "decimal",
    "(": "openParen",
    ")": "closeParen",
    Backspace: "delete",
    Delete: "ce",
    Escape: "clear",
  };

  if (keyMap[e.key]) {
    handleAction(keyMap[e.key]);
  } else if ("0123456789".includes(e.key)) {
    handleAction(e.key);
  }
});
