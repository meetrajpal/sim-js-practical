document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  products.render();

  const darkModeSwitch = document.getElementById("darkModeSwitch");
  const htmlEl = document.querySelector("html");

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    htmlEl.setAttribute("data-bs-theme", savedTheme);
    darkModeSwitch.checked = savedTheme === "dark";
  }

  darkModeSwitch.addEventListener("change", (e) => {
    const theme = e.target.checked ? "dark" : "light";
    htmlEl.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  });

  const sidebar = document.getElementById("sidebar");
  const optionDashboard = document.getElementById("optionDashboard");
  const optionProducts = document.getElementById("optionProducts");
  const dashboardPage = document.getElementById("dashboardPage");
  const productsPage = document.getElementById("productsPage");

  function showDashboard() {
    dashboardPage.classList.remove("d-none");
    productsPage.classList.add("d-none");
  }

  function showProducts() {
    productsPage.classList.remove("d-none");
    dashboardPage.classList.add("d-none");
  }

  function hideSidebar() {
    bootstrap.Offcanvas.getOrCreateInstance(sidebar).hide();
  }

  optionDashboard.checked = true;
  showDashboard();

  sidebar.addEventListener("click", (e) => {
    const checkbox = e.target.closest(".btn-check");
    if (!checkbox) return;
    if (optionProducts.checked) {
      showProducts();
    } else if (optionDashboard.checked) {
      showDashboard();
    }
    hideSidebar();
  });

  document.getElementById("checkAll").addEventListener("change", (e) => {
    document.querySelectorAll(".row-check").forEach((cb) => {
      cb.checked = e.target.checked;
    });
  });

  const idSearchTb = document.getElementById("idSearchTb");
  const nameSearchTb = document.getElementById("nameSearchTb");
  const searchToolbar = document.querySelector(
    "#productsPage .d-flex.flex-column.flex-lg-row.gap-2:last-child",
  );
  const btnSearch = searchToolbar.querySelector(".btn-primary");
  const btnClear = searchToolbar.querySelector(".btn-secondary");

  function handleSearch() {
    products.search(idSearchTb.value, nameSearchTb.value);
  }

  function handleClear() {
    idSearchTb.value = "";
    nameSearchTb.value = "";
    products.clearSearch();
  }

  btnSearch.addEventListener("click", handleSearch);
  btnClear.addEventListener("click", handleClear);
  idSearchTb.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });
  nameSearchTb.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  document.querySelectorAll("th[data-sort-column]").forEach((th) => {
    th.addEventListener("click", () =>
      products.cycleSort(th.dataset.sortColumn),
    );
  });

  const newProdModal = document.getElementById("newProdModal");

  document
    .querySelector("#newProdModal .modal-footer .btn-primary")
    .addEventListener("click", () => {
      const name = document.getElementById("prodName").value.trim();
      const priceRaw = document.getElementById("prodPrice").value.trim();
      const quantityRaw = document.getElementById("prodQuantity").value.trim();
      const description = document.getElementById("prodDesc").value.trim();
      const image = document.getElementById("prodImg").value.trim();

      const price = parseFloat(priceRaw);
      const quantity = parseInt(quantityRaw);

      const errors = [];
      if (!name) errors.push("• Name is required.");
      if (!priceRaw) errors.push("• Price is required.");
      else if (isNaN(price)) errors.push("• Price must be a number.");
      else if (price <= 0) errors.push("• Price must be greater than 0.");
      if (!quantityRaw) errors.push("• Quantity is required.");
      else if (isNaN(quantity))
        errors.push("• Quantity must be a whole number.");
      else if (quantity < 0) errors.push("• Quantity cannot be negative.");
      if (!description) errors.push("• Description is required.");
      if (!image) errors.push("• Image URL is required.");
      else if (!/^https?:\/\/.+\..+/.test(image))
        errors.push("• Please enter a valid image URL.");

      if (errors.length) {
        alert("Please fix the following:\n\n" + errors.join("\n"));
        return;
      }

      products.add({ name, price, quantity, description, image });
      document.querySelector("#newProdModal form").reset();
      bootstrap.Modal.getInstance(newProdModal).hide();
    });

  newProdModal.addEventListener("hidden.bs.modal", () => {
    document.querySelector("#newProdModal form").reset();
  });

  const delModalEl = document.getElementById("delProdModal");

  delModalEl.addEventListener("show.bs.modal", () => {
    document.getElementById("delCheckItems").textContent =
      products.getPendingDeleteCount();
  });

  delModalEl.addEventListener("hidden.bs.modal", () => {
    products.clearPendingDelete();
    document.getElementById("checkAll").checked = false;
  });

  document
    .querySelector("#delProdModal .modal-footer .btn-danger")
    .addEventListener("click", () => {
      products.confirmDelete();
      bootstrap.Modal.getInstance(delModalEl).hide();
    });

  document
    .getElementById("imgPreviewModal")
    .addEventListener("show.bs.modal", (e) => {
      document.getElementById("imgPreviewEl").src =
        e.relatedTarget.dataset.fullSrc;
    });
});
