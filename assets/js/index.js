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

optionProducts.checked = true;
renderProductsPage();

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
