const calcCurMode = (function () {
  const acceptableModes = ["standard", "scientific"];
  let mode = "standard";

  return {
    getMode() {
      return mode;
    },
    setMode(val) {
      if (!acceptableModes.includes(val)) return;
      mode = val;
    },
  };
})();

const buttonLayouts = {
  standard: [
    [
      { label: "%", action: "percent" },
      { label: "CE", action: "ce" },
      { label: "C", action: "clear" },
      { label: "&larr;", action: "delete" },
    ],
    [
      { label: "<sup>1</sup>/x", action: "reciprocal" },
      { label: "x<sup>2</sup>", action: "square" },
      { label: "&radic;x", action: "sqrt" },
      { label: "&divide;", action: "divide" },
    ],
    [
      { label: "7", action: "7" },
      { label: "8", action: "8" },
      { label: "9", action: "9" },
      { label: "&times;", action: "multiply" },
    ],
    [
      { label: "4", action: "4" },
      { label: "5", action: "5" },
      { label: "6", action: "6" },
      { label: "&minus;", action: "subtract" },
    ],
    [
      { label: "1", action: "1" },
      { label: "2", action: "2" },
      { label: "3", action: "3" },
      { label: "+", action: "add" },
    ],
    [
      { label: "&plusmn;", action: "negate" },
      { label: "0", action: "0" },
      { label: ".", action: "decimal" },
      { label: "=", action: "equals", primary: true },
    ],
  ],

  scientific: [
    [
      { label: "2<sup>nd</sup>", action: "second" },
      { label: "&pi;", action: "pi" },
      { label: "e", action: "e" },
      { label: "C", action: "clear" },
      { label: "&larr;", action: "delete" },
    ],
    [
      {
        label: "x&sup2;",
        action: "square",
        secondLabel: "x&sup3;",
        secondAction: "cube",
      },
      { label: "<sup>1</sup>/x", action: "reciprocal" },
      { label: "|X|", action: "abs" },
      { label: "exp", action: "exp" },
      { label: "mod", action: "mod" },
    ],
    [
      {
        label: "&radic;x",
        action: "sqrt",
        secondLabel: "&#8731;x",
        secondAction: "cbrt",
      },
      { label: "(", action: "openParen" },
      { label: ")", action: "closeParen" },
      { label: "n!", action: "factorial" },
      { label: "&divide;", action: "divide" },
    ],
    [
      {
        label: "x<sup>y</sup>",
        action: "power",
        secondLabel: "<sup>y</sup>&radic;x",
        secondAction: "yroot",
      },
      { label: "7", action: "7" },
      { label: "8", action: "8" },
      { label: "9", action: "9" },
      { label: "&times;", action: "multiply" },
    ],
    [
      {
        label: "10<sup>x</sup>",
        action: "10pow",
        secondLabel: "2<sup>x</sup>",
        secondAction: "2pow",
      },
      { label: "4", action: "4" },
      { label: "5", action: "5" },
      { label: "6", action: "6" },
      { label: "&minus;", action: "subtract" },
    ],
    [
      {
        label: "log",
        action: "log",
        secondLabel: "log<sub>y</sub>x",
        secondAction: "logy",
      },
      { label: "1", action: "1" },
      { label: "2", action: "2" },
      { label: "3", action: "3" },
      { label: "+", action: "add" },
    ],
    [
      {
        label: "ln",
        action: "ln",
        secondLabel: "e<sup>x</sup>",
        secondAction: "epow",
      },
      { label: "&plusmn;", action: "negate" },
      { label: "0", action: "0" },
      { label: ".", action: "decimal" },
      { label: "=", action: "equals", primary: true },
    ],
  ],
};

function renderBtnGrid() {
  const btnGrid = document.getElementById("btnGrid");
  btnGrid.replaceChildren();
  const currentMode = calcCurMode.getMode();
  const btns = buttonLayouts[currentMode];

  for (let arr of btns) {
    const rowDiv = document.createElement("div");
    rowDiv.className = `row g-1 mb-1 flex-grow-1 ${
      currentMode === "standard" ? "row-cols-4" : "row-cols-5"
    }`;

    for (let obj of arr) {
      const col = document.createElement("div");
      col.className = "col";

      if (obj.action === "second") {
        const checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.className = "btn-check";
        checkBox.id = "toggleSecondScientific";
        checkBox.autocomplete = "off";

        const label = document.createElement("label");
        label.className = "btn cstBtn w-100 h-100 fs-4";
        label.setAttribute("for", "toggleSecondScientific");
        label.innerHTML = obj.label;

        checkBox.addEventListener("change", (e) => {
          toggleSecondScientificLabels(e.target.checked);
        });

        col.appendChild(checkBox);
        col.appendChild(label);
      } else {
        const btn = document.createElement("button");
        btn.className = "btn cstBtn w-100 h-100 fs-4";
        btn.innerHTML = obj.label;
        btn.dataset.action = obj.action;
        btn.title = obj.action;
        btn.dataset.firstLabel = obj.label;
        btn.dataset.firstAction = obj.action;

        if (obj.secondLabel) btn.dataset.secondLabel = obj.secondLabel;
        if (obj.secondAction) {
          btn.dataset.secondAction = obj.secondAction;
          btn.dataset.secondScientific = true;
        }

        if (obj?.primary) {
          btn.classList.add("btn-primary");
          btn.classList.remove("cstBtn");
        }
        col.appendChild(btn);
      }
      rowDiv.appendChild(col);
    }
    btnGrid.appendChild(rowDiv);
  }
}

function toggleSecondScientificLabels(isSecond) {
  document.querySelectorAll("[data-second-scientific]").forEach((btn) => {
    btn.innerHTML = isSecond ? btn.dataset.secondLabel : btn.dataset.firstLabel;
    btn.dataset.action = isSecond
      ? btn.dataset.secondAction
      : btn.dataset.firstAction;
  });
}

function toggleSecondTrigoLabels(isSecond) {
  document.querySelectorAll("[data-second-trigo]").forEach((btn) => {
    btn.innerHTML = isSecond ? btn.dataset.secondLabel : btn.dataset.firstLabel;
    btn.dataset.action = isSecond
      ? btn.dataset.secondAction
      : btn.dataset.firstAction;
  });
}

const trigContent = `
  <div class="row row-cols-4 g-1 mb-1">
    <div class="col">
      <input type="checkbox" class="btn-check" id="trigSecondBtn" autocomplete="off" />
      <label class="btn cstBtn w-100 py-2" for="trigSecondBtn" data-action="trigSecond" title="trigSecond">2<sup>nd</sup></label>
    </div>
    <div class="col">
      <button class="btn cstBtn w-100 py-2" data-second-trigo="true" data-action="sin" title="sin"
        data-first-label="sin" data-first-action="sin"
        data-second-label="sin<sup>-1</sup>" data-second-action="asin"
        data-third-label="sinh" data-third-action="sinh">sin</button>
    </div>
    <div class="col">
      <button class="btn cstBtn w-100 py-2" data-second-trigo="true" data-action="cos" title="cos"
        data-first-label="cos" data-first-action="cos"
        data-second-label="cos<sup>-1</sup>" data-second-action="acos"
        data-third-label="cosh" data-third-action="cosh">cos</button>
    </div>
    <div class="col">
      <button class="btn cstBtn w-100 py-2" data-second-trigo="true" data-action="tan" title="tan"
        data-first-label="tan" data-first-action="tan"
        data-second-label="tan<sup>-1</sup>" data-second-action="atan"
        data-third-label="tanh" data-third-action="tanh">tan</button>
    </div>
  </div>
  <div class="row row-cols-4 g-1">
    <div class="col">
      <input type="checkbox" class="btn-check" id="hypBtn" autocomplete="off" />
      <label class="btn cstBtn w-100 py-2" for="hypBtn" data-action="hyp" title="hyp">hyp</label>
    </div>
    <div class="col">
      <button class="btn cstBtn w-100 py-2" data-second-trigo="true" data-action="sec" title="sec"
        data-first-label="sec" data-first-action="sec"
        data-second-label="sec<sup>-1</sup>" data-second-action="asec"
        data-third-label="sech" data-third-action="sech">sec</button>
    </div>
    <div class="col">
      <button class="btn cstBtn w-100 py-2" data-second-trigo="true" data-action="csc" title="csc"
        data-first-label="csc" data-first-action="csc"
        data-second-label="csc<sup>-1</sup>" data-second-action="acsc"
        data-third-label="csch" data-third-action="csch">csc</button>
    </div>
    <div class="col">
      <button class="btn cstBtn w-100 py-2" data-second-trigo="true" data-action="cot" title="cot"
        data-first-label="cot" data-first-action="cot"
        data-second-label="cot<sup>-1</sup>" data-second-action="acot"
        data-third-label="coth" data-third-action="coth">cot</button>
    </div>
  </div>
`;

const fnContent = `
  <div class="row row-cols-3 g-1 mb-1">
    <div class="col"><button class="btn cstBtn w-100 py-2" data-action="abs" title="abs">|x|</button></div>
    <div class="col"><button class="btn cstBtn w-100 py-2" data-action="floor" title="floor">&lfloor; x &rfloor;</button></div>
    <div class="col"><button class="btn cstBtn w-100 py-2" data-action="ceil" title="ceil">&lceil; x &rceil;</button></div>
  </div>
  <div class="row row-cols-3 g-1">
    <div class="col"><button class="btn cstBtn w-100 py-2" data-action="rand" title="rand">rand</button></div>
    <div class="col"><button class="btn cstBtn w-100 py-2" data-action="dms" title="dms">&rarr;dms</button></div>
    <div class="col"><button class="btn cstBtn w-100 py-2" data-action="deg" title="deg">&rarr;deg</button></div>
  </div>
`;

function initPopovers() {
  new bootstrap.Popover(document.getElementById("trigBtn"), {
    html: true,
    sanitize: false,
    content: trigContent,
    placement: "bottom",
    trigger: "click",
    customClass: "trig-popover",
    boundary: "clippingParents",
    fallbackPlacements: [],
  });

  new bootstrap.Popover(document.getElementById("fnBtn"), {
    html: true,
    sanitize: false,
    content: fnContent,
    placement: "bottom",
    trigger: "click",
    customClass: "fn-popover",
    boundary: "clippingParents",
    fallbackPlacements: [],
  });

  const popoverTriggerList = document.querySelectorAll(
    '[data-bs-toggle="popover"]',
  );
  document.addEventListener("click", (e) => {
    popoverTriggerList.forEach((el) => {
      const popover = bootstrap.Popover.getInstance(el);
      const popoverEl = document.querySelector(".popover");
      if (
        popover &&
        !el.contains(e.target) &&
        popoverEl &&
        !popoverEl.contains(e.target)
      ) {
        popover.hide();
      }
    });
  });
}

function hideSidebar() {
  const sidebar = document.getElementById("sidebar");
  const instance = bootstrap.Offcanvas.getOrCreateInstance(sidebar);
  instance.hide();
}

function applyStoredTheme() {
  const theme = localStorage.getItem("calcTheme");
  if (!["light", "dark"].includes(theme)) return;

  document.querySelector("html").setAttribute("data-bs-theme", theme);
  const trigoLogo = document.getElementById("trigoLogo");
  const fnLogo = document.getElementById("fnLogo");

  if (theme === "dark") {
    document.getElementById("darkModeSwitch").checked = true;
    trigoLogo?.setAttribute("fill", "#FFFF");
    fnLogo?.setAttribute("fill", "#FFFF");
  } else {
    document.getElementById("darkModeSwitch").checked = false;
    trigoLogo?.setAttribute("fill", "#000000");
    fnLogo?.setAttribute("fill", "#000000");
  }
}
