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
    .addEventListener("click", async () => {
      const name = document.getElementById("prodName").value.trim();
      const priceRaw = document.getElementById("prodPrice").value.trim();
      const quantityRaw = document.getElementById("prodQuantity").value.trim();
      const description = document.getElementById("prodDesc").value.trim();
      const imgFile = document.getElementById("prodImg").files[0];

      const price = parseFloat(priceRaw);
      const quantity = parseInt(quantityRaw);

      if (!name) {
        document.getElementById("nmeError").innerText = "Name is required.";
        return;
      } else if (name) {
        document.getElementById("nmeError").innerText = "";
      }

      if (!priceRaw) {
        document.getElementById("priceError").innerText = "Price is required.";
        return;
      } else if (isNaN(price)) {
        document.getElementById("priceError").innerText =
          "Price must be a number.";
        return;
      } else if (price <= 0) {
        document.getElementById("priceError").innerText =
          "Price must be greater than 0.";
        return;
      } else {
        document.getElementById("priceError").innerText = "";
      }

      if (!quantityRaw) {
        document.getElementById("qtyError").innerText = "Quantity is required.";
        return;
      } else if (isNaN(quantity)) {
        document.getElementById("qtyError").innerText =
          "Quantity must be a whole number.";
        return;
      } else if (quantity < 0) {
        document.getElementById("qtyError").innerText =
          "Quantity cannot be negative.";
        return;
      } else {
        document.getElementById("qtyError").innerText = "";
      }

      if (!description) {
        document.getElementById("descError").innerText =
          "Description is required.";
        return;
      } else if (description.length > 300) {
        document.getElementById("descError").innerText =
          "Description length should be upto 300 characters only.";
        return;
      } else if (description) {
        document.getElementById("descError").innerText = "";
      }

      if (!imgFile) {
        document.getElementById("imgError").innerText = "Image is required.";
        return;
      } else if (imgFile) {
        document.getElementById("imgError").innerText = "";
      }

      const result = await products.add(
        { name, price, quantity, description },
        imgFile,
      );
      if (result) {
        document.querySelector("#newProdModal form").reset();
        bootstrap.Modal.getInstance(newProdModal).hide();
      }
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

  document.getElementById("prodPrice").addEventListener("keydown", (e) => {
    const prevented = ["e", "E", "+", "-"];
    if (prevented.includes(e.key)) e.preventDefault();
  });
});
