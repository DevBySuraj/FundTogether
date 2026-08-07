// ===============================
// THEME TOGGLE
// ===============================

const themeToggle = document.getElementById("themeToggle");
const html = document.documentElement;
const icon = themeToggle.querySelector("i");

// Load saved theme
const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  html.setAttribute("data-bs-theme", savedTheme);
  updateIcon(savedTheme);
}

themeToggle.addEventListener("click", () => {
  const currentTheme = html.getAttribute("data-bs-theme");

  const newTheme = currentTheme === "light" ? "dark" : "light";

  html.setAttribute("data-bs-theme", newTheme);

  localStorage.setItem("theme", newTheme);

  updateIcon(newTheme);
});

function updateIcon(theme) {
  if (theme === "dark") {
    icon.classList.remove("bi-moon-stars-fill");
    icon.classList.add("bi-sun-fill");
  } else {
    icon.classList.remove("bi-sun-fill");
    icon.classList.add("bi-moon-stars-fill");
  }
}

// ===============================
// BRUTAL BUTTON CLICK EFFECT
// ===============================

document.querySelectorAll(".brutal-btn, .hero-btn").forEach((button) => {
  button.addEventListener("mousedown", () => {
    button.style.transform = "translate(2px,2px)";
  });

  button.addEventListener("mouseup", () => {
    button.style.transform = "";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "";
  });
});

// ===============================
// MODAL RESET AFTER CLOSE
// ===============================

const modal = document.getElementById("signinModal");

modal.addEventListener("hidden.bs.modal", () => {
  modal.querySelector("form").reset();
});

// ===============================
// NAVBAR SHADOW ON SCROLL
// ===============================

window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");

  if (window.scrollY > 30) {
    navbar.style.transform = "translateY(-4px)";
    navbar.style.transition = ".25s";
  } else {
    navbar.style.transform = "translateY(0)";
  }
});
