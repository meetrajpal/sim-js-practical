const HistoryManager = (function () {
  let history = JSON.parse(localStorage.getItem("calcHistory") || "[]");

  function persist() {
    localStorage.setItem("calcHistory", JSON.stringify(history));
  }

  return {
    save(expression, result) {
      history.unshift({ expression, result });
      if (history.length > 50) history.pop();
      persist();

      const optionHistory = document.getElementById("optionHistory");
      if (optionHistory) optionHistory.checked = true;
      this.render();
    },

    get() {
      return [...history];
    },

    clear() {
      history = [];
      localStorage.removeItem("calcHistory");
      this.render();
    },

    render() {
      const historyEl = document.getElementById("history");
      if (!historyEl) return;
      historyEl.innerHTML =
        history.length === 0
          ? "<p class='text-muted mt-3'>There's no history yet.</p>"
          : history
              .map(
                (h) => `
              <div class="cursor-pointer py-2 px-3 text-end history-item"
                   data-result="${h.result}"
                   data-expression="${h.expression}"
                   title="Select this evaluation">
                <div class="text-muted small">${h.expression}</div>
                <div class="fs-5">${h.result}</div>
              </div>`,
              )
              .join("");
    },
  };
})();

const MemoryManager = (function () {
  let memory = JSON.parse(localStorage.getItem("calcMemory") || "[]");

  function persist() {
    localStorage.setItem("calcMemory", JSON.stringify(memory));
  }

  function getTop() {
    return memory.length > 0 ? memory[0] : 0;
  }

  return {
    store(val) {
      memory.unshift(val);
      if (memory.length > 50) memory.pop();
      persist();
      const optionMemory = document.getElementById("optionMemory");
      if (optionMemory) optionMemory.checked = true;
      this.render();
    },

    recall() {
      return getTop();
    },

    add(val) {
      this.store(getTop() + val);
    },

    subtract(val) {
      this.store(getTop() - val);
    },

    clear() {
      memory = [];
      localStorage.removeItem("calcMemory");
      this.render();
    },

    render() {
      const historyEl = document.getElementById("history");
      if (!historyEl) return;
      historyEl.innerHTML =
        memory.length === 0
          ? "<p class='text-muted mt-3'>There's nothing saved in memory.</p>"
          : memory
              .map(
                (m) => `
              <div class="cursor-pointer py-2 px-3 text-end memory-item" data-result="${m}">
                <div>&nbsp;</div>
                <div class="fs-5">${m}</div>
              </div>`,
              )
              .join("");
    },
  };
})();
