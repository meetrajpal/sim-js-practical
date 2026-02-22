class Products {
  #products = [];
  #filtered = [];
  #searchId = "";
  #searchName = "";
  #editingId = null;
  #deleteId = null;
  #sort = { column: null, order: "default" };

  constructor() {
    this.#products = this.#load();
  }

  #load() {
    try {
      return JSON.parse(localStorage.getItem("products")) || [];
    } catch {
      return [];
    }
  }

  #save() {
    localStorage.setItem("products", JSON.stringify(this.#products));
  }

  #generateId() {
    return Math.random().toString(36).slice(2, 6);
  }

  #applyFilter() {
    const sid = this.#searchId.trim().toLowerCase();
    const sname = this.#searchName.trim().toLowerCase();
    this.#filtered = this.#products.filter((p) => {
      return (
        (!sid || p.id.toLowerCase().includes(sid)) &&
        (!sname || p.name.toLowerCase().includes(sname))
      );
    });
  }

  #sortData(data) {
    if (this.#sort.order === "default" || !this.#sort.column) return data;
    return [...data].sort((a, b) => {
      const valA =
        this.#sort.column === "name" ? a.name.toLowerCase() : Number(a.price);
      const valB =
        this.#sort.column === "name" ? b.name.toLowerCase() : Number(b.price);
      if (valA < valB) return this.#sort.order === "asc" ? -1 : 1;
      if (valA > valB) return this.#sort.order === "asc" ? 1 : -1;
      return 0;
    });
  }

  #renderRow(p) {
    const isEditing = this.#editingId === p.id;
    return `
      <tr data-id="${p.id}">
        <td>
          <input type="checkbox" class="form-check-input row-check" data-id="${p.id}" />
        </td>
        <td class="position-sticky start-0 text-muted small">${p.id}</td>
        <td>
          <input
            type="text"
            class="form-control form-control-sm row-input"
            data-id="${p.id}"
            data-column="name"
            value="${p.name}"
            disabled
          />
        </td>
        <td>
          <input
            type="number"
            class="form-control form-control-sm row-input"
            data-id="${p.id}"
            data-column="price"
            value="${p.price}"
            min="1"
            style="width:90px"
            disabled
          />
        </td>
        <td style="width:110px">
          ${
            p.image
              ? `<img class="img-fluid row-img mb-1 cursor-pointer" data-id="${p.id}" src="${p.image}" alt="${p.name}" style="max-height:50px;display:block" data-bs-toggle="modal" data-bs-target="#imgPreviewModal" data-full-src="${p.image}" />`
              : `<span class="text-muted small no-img-label" data-id="${p.id}">No image</span>`
          }
          <input type="url" class="form-control form-control-sm inline-img-input row-input d-none" data-id="${p.id}" placeholder="https://example.com/image.jpg" data-column="image" />
        </td>
        <td>
          <input
            type="number"
            class="form-control form-control-sm row-input"
            data-id="${p.id}"
            data-column="quantity"
            value="${p.quantity}"
            min="0"
            style="width:90px"
            disabled
          />
        </td>
        <td>
          <input
            type="text"
            class="form-control form-control-sm row-input"
            data-id="${p.id}"
            data-column="description"
            value="${p.description}"
            disabled
          />
        </td>
        <td>
          <div class="d-flex gap-1 justify-content-center">
            <button class="btn btn-warning btn-sm btn-edit ${isEditing ? "d-none" : ""}" data-id="${p.id}" title="Edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-danger btn-sm btn-delete-row ${isEditing ? "d-none" : ""}" data-id="${p.id}" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-success btn-sm btn-save-inline ${isEditing ? "" : "d-none"}" data-id="${p.id}" title="Save">
              <i class="bi bi-check-lg"></i>
            </button>
            <button class="btn btn-secondary btn-sm btn-cancel-inline ${isEditing ? "" : "d-none"}" data-id="${p.id}" title="Cancel">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }

  #enableRow(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;
    row.querySelectorAll(".row-input").forEach((el) => (el.disabled = false));
    const urlInput = row.querySelector(".inline-img-input");
    if (urlInput) {
      urlInput.value = this.#products.find((p) => p.id === id)?.image || "";
      urlInput.classList.remove("d-none");
    }
    const imgEl = row.querySelector(".row-img");
    if (imgEl) imgEl.classList.add("d-none");
    row.querySelector(".btn-edit").classList.add("d-none");
    row.querySelector(".btn-delete-row").classList.add("d-none");
    row.querySelector(".btn-save-inline").classList.remove("d-none");
    row.querySelector(".btn-cancel-inline").classList.remove("d-none");
  }

  #cancelEditRow(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;
    row.querySelectorAll(".row-input").forEach((el) => (el.disabled = true));
    row.querySelector(".btn-edit").classList.remove("d-none");
    row.querySelector(".btn-delete-row").classList.remove("d-none");
    row.querySelector(".btn-save-inline").classList.add("d-none");
    row.querySelector(".btn-cancel-inline").classList.add("d-none");
    const urlInput = row.querySelector(".inline-img-input");
    if (urlInput) urlInput.classList.add("d-none");
    const imgEl = row.querySelector(".row-img");
    if (imgEl) imgEl.classList.remove("d-none");
  }

  #setCardValue(cardBody, value) {
    let span = cardBody.querySelector(".card-value");
    if (!span) {
      span = document.createElement("span");
      span.className = "card-value";
      cardBody.appendChild(span);
    }
    span.textContent = " " + value;
  }

  #updateDashboard() {
    const { totalProducts, totalQty, totalValue } = this.getStats();
    const cardBodies = document.querySelectorAll("#dashboardPage .card-body");
    if (cardBodies[0])
      this.#setCardValue(cardBodies[0], totalProducts.toLocaleString());
    if (cardBodies[1])
      this.#setCardValue(cardBodies[1], totalQty.toLocaleString());
    if (cardBodies[2])
      this.#setCardValue(cardBodies[2], totalValue.toLocaleString());
  }

  #updateSortIcons() {
    document.querySelectorAll("th[data-sort-column]").forEach((th) => {
      const icon = th.querySelector(".sort-icon");
      if (!icon) return;
      if (th.dataset.sortColumn !== this.#sort.column) {
        icon.innerHTML = "&#8593;&#8595;";
      } else {
        icon.innerHTML = this.#sort.order === "asc" ? "&#8593;" : "&#8595;";
      }
    });
  }

  add(data) {
    const product = { id: this.#generateId(), ...data };
    this.#products.push(product);
    this.#save();
    this.render();
  }

  update(id, data) {
    this.#products = this.#products.map((p) =>
      p.id === id ? { ...p, ...data } : p,
    );
    this.#save();
    this.#editingId = null;
    this.render();
  }

  delete(id) {
    if (this.#editingId === id) this.#editingId = null;
    this.#products = this.#products.filter((p) => p.id !== id);
    this.#save();
    this.render();
  }

  deleteSelected() {
    const checked = this.getCheckedIds();
    if (!checked.length) return;
    if (checked.includes(this.#editingId)) this.#editingId = null;
    this.#products = this.#products.filter((p) => !checked.includes(p.id));
    this.#save();
    this.render();
  }

  search(id, name) {
    this.#searchId = id;
    this.#searchName = name;
    this.render();
  }

  clearSearch() {
    this.#searchId = "";
    this.#searchName = "";
    this.render();
  }

  cycleSort(column) {
    if (this.#sort.column !== column) {
      this.#sort = { column, order: "asc" };
    } else {
      const cycle = { asc: "desc", desc: "default", default: "asc" };
      this.#sort.order = cycle[this.#sort.order];
      if (this.#sort.order === "default") this.#sort.column = null;
    }
    this.#updateSortIcons();
    this.render();
  }

  startEdit(id) {
    if (this.#editingId && this.#editingId !== id) {
      this.#cancelEditRow(this.#editingId);
    }
    this.#editingId = id;
    this.#enableRow(id);
  }

  cancelEdit() {
    if (this.#editingId) {
      this.#editingId = null;
      this.render();
    }
  }

  saveEdit(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;

    const nameVal = row.querySelector('[data-column="name"]').value.trim();
    const priceRaw = row.querySelector('[data-column="price"]').value.trim();
    const quantityRaw = row
      .querySelector('[data-column="quantity"]')
      .value.trim();
    const description = row
      .querySelector('[data-column="description"]')
      .value.trim();

    const price = parseFloat(priceRaw);
    const quantity = parseInt(quantityRaw);

    const errors = [];
    if (!nameVal) errors.push("• Name is required.");
    if (!priceRaw) errors.push("• Price is required.");
    else if (isNaN(price)) errors.push("• Price must be a number.");
    else if (price <= 0) errors.push("• Price must be greater than 0.");
    if (!quantityRaw) errors.push("• Quantity is required.");
    else if (isNaN(quantity)) errors.push("• Quantity must be a whole number.");
    else if (quantity < 0) errors.push("• Quantity cannot be negative.");
    if (!description) errors.push("• Description is required.");

    if (errors.length) {
      alert("Please fix the following:\n\n" + errors.join("\n"));
      return;
    }

    const urlInput = row.querySelector(".inline-img-input");
    const image =
      urlInput && urlInput.value.trim()
        ? urlInput.value.trim()
        : this.#products.find((p) => p.id === id)?.image || "";

    this.update(id, { name: nameVal, price, quantity, description, image });
  }

  setPendingDelete(id) {
    this.#deleteId = id;
  }

  clearPendingDelete() {
    this.#deleteId = null;
  }

  getPendingDeleteCount() {
    return this.#deleteId ? 1 : this.getCheckedIds().length;
  }

  confirmDelete() {
    const singleId = this.#deleteId;
    this.#deleteId = null;
    if (singleId) {
      this.delete(singleId);
    } else {
      this.deleteSelected();
    }
  }

  getCheckedIds() {
    return [...document.querySelectorAll(".row-check:checked")].map(
      (cb) => cb.dataset.id,
    );
  }

  getStats() {
    return {
      totalProducts: this.#products.length,
      totalQty: this.#products.reduce((s, p) => s + Number(p.quantity), 0),
      totalValue: this.#products.reduce(
        (s, p) => s + Number(p.price) * Number(p.quantity),
        0,
      ),
    };
  }

  render() {
    this.#applyFilter();
    this.#renderTable();
    this.#updateDashboard();
  }

  #renderTable() {
    const tbody = document.querySelector("#productsPage tbody");
    const data = this.#sortData(this.#filtered);

    if (!data.length) {
      tbody.replaceChildren();
      return;
    }

    tbody.innerHTML = data.map((p) => this.#renderRow(p)).join("");

    tbody.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", () => this.startEdit(btn.dataset.id));
    });

    tbody.querySelectorAll(".btn-save-inline").forEach((btn) => {
      btn.addEventListener("click", () => this.saveEdit(btn.dataset.id));
    });

    tbody.querySelectorAll(".btn-cancel-inline").forEach((btn) => {
      btn.addEventListener("click", () => this.cancelEdit());
    });

    tbody.querySelectorAll(".btn-delete-row").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setPendingDelete(btn.dataset.id);
        bootstrap.Modal.getOrCreateInstance(
          document.getElementById("delProdModal"),
        ).show();
      });
    });

    tbody.querySelectorAll(".inline-img-input").forEach((input) => {
      input.addEventListener("input", () => {
        const preview = tbody.querySelector(
          `.row-img[data-id="${input.dataset.id}"]`,
        );
        if (preview && input.value.trim()) preview.src = input.value.trim();
      });
    });

    if (this.#editingId) this.#enableRow(this.#editingId);
  }
}
