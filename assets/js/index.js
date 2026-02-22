const STORAGE_KEY = "products";
const PAGE_SIZE = 10;

let state = {
  products: [],
  filtered: [],
  currentPage: 1,
  searchId: "",
  searchName: "",
  editingId: null,
  deleteId: null,
  sort: { field: null, order: "default" },
};

function loadProducts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    if (e.name === "QuotaExceededError" || e.code === 22) {
      alert(
        "Images are also stored in local storage as base64 string and local storage is full.\nPlease delete some products or use smaller images.\nOr clear the local storage.",
      );
      state.products = loadProducts();
      applyFilter();
    }
  }
}

function generateId() {
  return Math.random().toString(36).slice(2, 5);
}

function addProduct(data) {
  const product = { id: generateId(), ...data };
  state.products.push(product);
  saveProducts(state.products);
  applyFilter();
}

function updateProduct(id, data) {
  state.products = state.products.map((p) =>
    p.id === id ? { ...p, ...data } : p,
  );
  saveProducts(state.products);
  state.editingId = null;
  applyFilter();
}

function deleteProduct(id) {
  if (state.editingId === id) state.editingId = null;
  state.products = state.products.filter((p) => p.id !== id);
  saveProducts(state.products);
  applyFilter();
}

function deleteSelected() {
  const checked = getCheckedIds();
  if (!checked.length) return;
  if (checked.includes(state.editingId)) state.editingId = null;
  state.products = state.products.filter((p) => !checked.includes(p.id));
  saveProducts(state.products);
  applyFilter();
}

function applyFilter() {
  const sid = state.searchId.trim().toLowerCase();
  const sname = state.searchName.trim().toLowerCase();
  state.filtered = state.products.filter((p) => {
    return (
      (!sid || p.id.toLowerCase().includes(sid)) &&
      (!sname || p.name.toLowerCase().includes(sname))
    );
  });
  const maxPage = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
  if (state.currentPage > maxPage) state.currentPage = maxPage;
  renderTable();
  renderPagination();
  updateDashboard();
}

function sortData(data) {
  if (state.sort.order === "default" || !state.sort.field) return data;
  return [...data].sort((a, b) => {
    const valA =
      state.sort.field === "name" ? a.name.toLowerCase() : Number(a.price);
    const valB =
      state.sort.field === "name" ? b.name.toLowerCase() : Number(b.price);
    if (valA < valB) return state.sort.order === "asc" ? -1 : 1;
    if (valA > valB) return state.sort.order === "asc" ? 1 : -1;
    return 0;
  });
}

function pageData() {
  const start = (state.currentPage - 1) * PAGE_SIZE;
  return sortData(state.filtered).slice(start, start + PAGE_SIZE);
}

function renderTable() {
  const tbody = document.querySelector("#productsPage tbody");

  const data = pageData();

  if (!data.length) {
    tbody.replaceChildren();
    return;
  }

  tbody.innerHTML = data.map((p) => renderRow(p)).join("");

  tbody.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;

      if (state.editingId && state.editingId !== id)
        cancelEdit(state.editingId);
      state.editingId = id;
      enableRow(id);
    });
  });

  tbody.querySelectorAll(".btn-save-inline").forEach((btn) => {
    btn.addEventListener("click", () => saveInlineEdit(btn.dataset.id));
  });

  tbody.querySelectorAll(".btn-cancel-inline").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.editingId = null;

      applyFilter();
    });
  });

  tbody.querySelectorAll(".btn-delete-row").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.deleteId = btn.dataset.id;
      bootstrap.Modal.getOrCreateInstance(
        document.getElementById("delProdModal"),
      ).show();
    });
  });

  tbody.querySelectorAll(".inline-img-input").forEach((input) => {
    input.addEventListener("input", () => {
      const id = input.dataset.id;
      const preview = tbody.querySelector(`.row-img[data-id="${id}"]`);
      if (preview && input.value.trim()) preview.src = input.value.trim();
    });
  });

  if (state.editingId) {
    enableRow(state.editingId);
  }
}

function renderRow(p) {
  const isEditing = state.editingId === p.id;
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
          data-field="name"
          value="${p.name}"
          disabled
        />
      </td>

      <td>
        <input
          type="number"
          class="form-control form-control-sm row-input"
          data-id="${p.id}"
          data-field="price"
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
        <input type="url" class="form-control form-control-sm inline-img-input row-input d-none" data-id="${p.id}" placeholder="https://example.com/image.jpg" data-field="image" />
      </td>

      <td>
        <input
          type="number"
          class="form-control form-control-sm row-input"
          data-id="${p.id}"
          data-field="quantity"
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
          data-field="description"
          value="${p.description}"
          disabled
          required
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

function enableRow(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  row.querySelectorAll(".row-input").forEach((el) => (el.disabled = false));

  const urlInput = row.querySelector(".inline-img-input");
  if (urlInput) {
    urlInput.value = state.products.find((p) => p.id === id)?.image || "";
    urlInput.classList.remove("d-none");
  }

  const imgEl = row.querySelector(".row-img");
  if (imgEl) imgEl.classList.add("d-none");

  row.querySelector(".btn-edit").classList.add("d-none");
  row.querySelector(".btn-delete-row").classList.add("d-none");
  row.querySelector(".btn-save-inline").classList.remove("d-none");
  row.querySelector(".btn-cancel-inline").classList.remove("d-none");
}

function cancelEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;
  row.querySelectorAll(".row-input").forEach((el) => (el.disabled = true));
  row.querySelector(".btn-edit").classList.remove("d-none");
  row.querySelector(".btn-delete-row").classList.remove("d-none");
  row.querySelector(".btn-save-inline").classList.add("d-none");
  row.querySelector(".btn-cancel-inline").classList.add("d-none");
  const fileInput = row.querySelector(".inline-img-input");
  if (fileInput) fileInput.classList.add("d-none");
}

function saveInlineEdit(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (!row) return;

  const nameVal = row.querySelector('[data-field="name"]').value.trim();
  const priceRaw = row.querySelector('[data-field="price"]').value.trim();
  const quantityRaw = row.querySelector('[data-field="quantity"]').value.trim();
  const description = row
    .querySelector('[data-field="description"]')
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
      : state.products.find((p) => p.id === id)?.image || "";

  updateProduct(id, { name: nameVal, price, quantity, description, image });
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
  const ul = document.querySelector("#productsPage .pagination");
  const info = document.querySelector("#productsPage p.text-muted");

  if (state.filtered.length === 0) {
    ul.replaceChildren();
    info.replaceChildren();
    return;
  }

  let html = `
    <li class="page-item ${state.currentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="${state.currentPage - 1}">Previous</a>
    </li>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `
    <li class="page-item ${i === state.currentPage ? "active" : ""}">
      <a class="page-link" href="#" data-page="${i}">${i}</a>
    </li>`;
  }

  html += `
    <li class="page-item ${state.currentPage === totalPages ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="${state.currentPage + 1}">Next</a>
    </li>`;

  ul.innerHTML = html;

  if (state.filtered.length !== 0) {
    const start = (state.currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(state.currentPage * PAGE_SIZE, state.filtered.length);
    info.textContent = `Showing ${start}-${end} of ${state.filtered.length} products`;
  }

  ul.querySelectorAll(".page-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = parseInt(link.dataset.page);
      const maxPage = Math.ceil(state.filtered.length / PAGE_SIZE);
      if (page >= 1 && page <= maxPage) {
        state.currentPage = page;
        state.editingId = null;
        applyFilter();
      }
    });
  });
}

function updateDashboard() {
  const products = state.products;
  const totalProducts = products.length;
  const totalQty = products.reduce((s, p) => s + Number(p.quantity), 0);
  const totalValue = products.reduce(
    (s, p) => s + Number(p.price) * Number(p.quantity),
    0,
  );

  const cardBodies = document.querySelectorAll("#dashboardPage .card-body");
  if (cardBodies[0])
    setCardValue(cardBodies[0], totalProducts.toLocaleString());
  if (cardBodies[1]) setCardValue(cardBodies[1], totalQty.toLocaleString());
  if (cardBodies[2]) setCardValue(cardBodies[2], totalValue.toLocaleString());
}

function setCardValue(cardBody, value) {
  let span = cardBody.querySelector(".card-value");
  if (!span) {
    span = document.createElement("span");
    span.className = "card-value";
    cardBody.appendChild(span);
  }
  span.textContent = " " + value;
}

function getCheckedIds() {
  return [...document.querySelectorAll(".row-check:checked")].map(
    (cb) => cb.dataset.id,
  );
}

document.querySelectorAll("th[data-sort]").forEach((th) => {
  th.addEventListener("click", () => {
    const field = th.dataset.sort;
    if (state.sort.field !== field) {
      state.sort = { field, order: "asc" };
    } else {
      const cycle = { asc: "desc", desc: "default", default: "asc" };
      state.sort.order = cycle[state.sort.order];
      if (state.sort.order === "default") state.sort.field = null;
    }
    updateSortIcons();
    applyFilter();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const darkModeSwitch = document.getElementById("darkModeSwitch");
  const htmlElement = document.querySelector("html");

  if (localStorage.getItem("calcTheme")) {
    let theme = localStorage.getItem("calcTheme");
    if (["light", "dark"].includes(theme)) {
      htmlElement.setAttribute("data-bs-theme", theme);
      theme === "dark"
        ? (darkModeSwitch.checked = true)
        : (darkModeSwitch.checked = false);
    }
  }

  darkModeSwitch.addEventListener("change", (e) => {
    if (e.target.checked) {
      htmlElement.setAttribute("data-bs-theme", "dark");
      localStorage.setItem("calcTheme", "dark");
    } else {
      htmlElement.setAttribute("data-bs-theme", "light");
      localStorage.setItem("calcTheme", "light");
    }
  });

  function hideSidebar() {
    const instance = bootstrap.Offcanvas.getOrCreateInstance(sidebar);
    if (instance) {
      instance.hide();
    }
  }

  const optionDashboard = document.getElementById("optionDashboard");
  const optionProducts = document.getElementById("optionProducts");

  const dashboardPage = document.getElementById("dashboardPage");
  const productsPage = document.getElementById("productsPage");

  function renderProductsPage() {
    productsPage.classList.remove("d-none");
    dashboardPage.classList.add("d-none");
  }

  function renderDashboardPage() {
    dashboardPage.classList.remove("d-none");
    productsPage.classList.add("d-none");
  }

  optionDashboard.checked = true;
  renderDashboardPage();

  document.getElementById("sidebar").addEventListener("click", (e) => {
    const checkbox = e.target.closest(".btn-check");
    if (!checkbox) return;
    if (optionProducts.checked) {
      renderProductsPage();
      hideSidebar();
    } else if (optionDashboard.checked) {
      renderDashboardPage();
      hideSidebar();
    }
  });

  state.products = loadProducts();
  applyFilter();

  document.getElementById("checkAll").addEventListener("change", (e) => {
    document.querySelectorAll(".row-check").forEach((cb) => {
      cb.checked = e.target.checked;
    });
  });

  const searchToolbar = document.querySelector(
    "#productsPage .d-flex.flex-column.flex-lg-row.gap-2:last-child",
  );
  const btnSearch = searchToolbar.querySelector(".btn-primary");
  const btnClear = searchToolbar.querySelector(".btn-secondary");

  function doSearch() {
    state.searchId = document.getElementById("idSearchTb").value;
    state.searchName = document.getElementById("nameSearchTb").value;
    state.currentPage = 1;
    applyFilter();
  }

  function clearSearch() {
    document.getElementById("idSearchTb").value = "";
    document.getElementById("nameSearchTb").value = "";
    state.searchId = "";
    state.searchName = "";
    state.currentPage = 1;
    applyFilter();
  }

  btnSearch.addEventListener("click", doSearch);
  btnClear.addEventListener("click", clearSearch);

  document.getElementById("idSearchTb").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });
  document.getElementById("nameSearchTb").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });

  document
    .querySelector("#newProdModal .modal-footer .btn-primary")
    .addEventListener("click", async () => {
      const name = document.getElementById("prodName").value.trim();
      const price = parseFloat(
        document.getElementById("prodPrice").value.trim(),
      );
      const quantity = parseInt(
        document.getElementById("prodQuantity").value.trim(),
      );
      const description = document.getElementById("prodDesc").value.trim();
      const image = document.getElementById("prodImg").value.trim();

      const errors = [];
      if (!name) errors.push("• Name is required.");
      if (!price) errors.push("• Price is required. And it must be a number.");
      else if (isNaN(price)) errors.push("• Price must be a number.");
      else if (price <= 0) errors.push("• Price must be greater than 0.");
      if (!quantity)
        errors.push("• Quantity is required. And it must be a number.");
      else if (isNaN(quantity)) errors.push("• Quantity must be a number.");
      else if (quantity < 0) errors.push("• Quantity cannot be negative.");
      if (!description) errors.push("• Description is required.");
      if (!image) errors.push("• Image URL is required.");
      else if (!/^https?:\/\/.+\..+/.test(image))
        errors.push("• Please enter a valid image URL.");

      if (errors.length) {
        alert("Please fix the following:\n\n" + errors.join("\n"));
        return;
      }

      addProduct({ name, price, quantity, description, image });

      document.querySelector("#newProdModal form").reset();
      bootstrap.Modal.getInstance(
        document.getElementById("newProdModal"),
      ).hide();
    });

  document
    .getElementById("newProdModal")
    .addEventListener("hidden.bs.modal", () => {
      document.querySelector("#newProdModal form").reset();
    });

  const delModalEl = document.getElementById("delProdModal");
  delModalEl.addEventListener("show.bs.modal", () => {
    const count = state.deleteId ? 1 : getCheckedIds().length;
    document.getElementById("delCheckItems").textContent = count;
  });

  delModalEl.addEventListener("hidden.bs.modal", () => {
    state.deleteId = null;
  });

  document
    .querySelector("#delProdModal .modal-footer .btn-danger")
    .addEventListener("click", () => {
      const singleId = state.deleteId;
      state.deleteId = null;

      if (singleId) {
        deleteProduct(singleId);
      } else {
        deleteSelected();
        document.getElementById("checkAll").checked = false;
      }

      bootstrap.Modal.getInstance(delModalEl).hide();
    });

  document
    .getElementById("imgPreviewModal")
    .addEventListener("show.bs.modal", (e) => {
      const trigger = e.relatedTarget;
      document.getElementById("imgPreviewEl").src = trigger.dataset.fullSrc;
    });
});
