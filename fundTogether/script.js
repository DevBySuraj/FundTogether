/*====================================================

        fundTogether
        script.js
        PART 1

====================================================*/

//=========================
// PAGE REFERENCES
//=========================

const pages = document.querySelectorAll(".page");

const homePage = document.getElementById("homePage");
const searchPage = document.getElementById("searchPage");
const donatePage = document.getElementById("donatePage");
const campaignPage = document.getElementById("campaignPage");
const createPage = document.getElementById("createPage");

//=========================
// BUTTONS
//=========================

const searchBtn = document.getElementById("searchBtn");
const heroSearchBtn = document.getElementById("heroSearchBtn");

const campaignBtn = document.getElementById("campaignBtn");

const donateLinks = document.querySelectorAll(".donate-page-link");

const categoryCards = document.querySelectorAll(".campaign-open");

const campaignCards = document.querySelectorAll(".category-open");

const backHome = document.querySelectorAll(".back-home");

const backDonate = document.querySelectorAll(".back-donate");

//=========================
// SHOW PAGE
//=========================

function showPage(page) {
  pages.forEach(function (item) {
    item.classList.remove("active-page");
  });

  page.classList.add("active-page");

  window.scrollTo({
    top: 0,

    behavior: "smooth",
  });
}

//=========================
// SEARCH PAGE
//=========================

searchBtn.addEventListener("click", function () {
  showPage(searchPage);
});

heroSearchBtn.addEventListener("click", function () {
  showPage(searchPage);
});

//=========================
// DONATE PAGE
//=========================

donateLinks.forEach(function (item) {
  item.addEventListener("click", function (e) {
    e.preventDefault();

    showPage(donatePage);
  });
});

//=========================
// CAMPAIGN DETAILS
//=========================

categoryCards.forEach(function (card) {
  card.addEventListener("click", function () {
    showPage(campaignPage);
  });
});

campaignCards.forEach(function (card) {
  card.addEventListener("click", function () {
    showPage(campaignPage);
  });
});

//=========================
// CREATE CAMPAIGN PAGE
//=========================

campaignBtn.addEventListener("click", function () {
  showPage(createPage);
});

//=========================
// BACK BUTTONS
//=========================

backHome.forEach(function (btn) {
  btn.addEventListener("click", function () {
    showPage(homePage);
  });
});

backDonate.forEach(function (btn) {
  btn.addEventListener("click", function () {
    showPage(donatePage);
  });
});

//=========================
// THEME TOGGLE
//=========================

const themeButton = document.getElementById("themeToggle");

const html = document.documentElement;

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  html.setAttribute("data-bs-theme", savedTheme);

  updateThemeIcon(savedTheme);
}

themeButton.addEventListener("click", function () {
  const current = html.getAttribute("data-bs-theme");

  const next = current === "dark" ? "light" : "dark";

  html.setAttribute("data-bs-theme", next);

  localStorage.setItem("theme", next);

  updateThemeIcon(next);
});

function updateThemeIcon(mode) {
  if (mode === "light") {
    themeButton.innerHTML = '<i class="bi bi-sun-fill"></i>';
  } else {
    themeButton.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
  }
}

/*====================================================

            PART 2 CONTINUES...

====================================================*/

/*====================================================

        SIGN IN FORM
        PART 2

====================================================*/

const signinForm = document.getElementById("signinForm");

signinForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const first = document.getElementById("firstName").value.trim();

  const last = document.getElementById("lastName").value.trim();

  const email = document.getElementById("email").value.trim();

  const password = document.getElementById("password").value;

  const confirm = document.getElementById("confirmPassword").value;

  //=========================
  // VALIDATION
  //=========================

  if (
    first === "" ||
    last === "" ||
    email === "" ||
    password === "" ||
    confirm === ""
  ) {
    alert("Please fill all fields.");

    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    alert("Enter a valid email.");

    return;
  }

  if (password.length < 6) {
    alert("Password must contain at least 6 characters.");

    return;
  }

  if (password !== confirm) {
    alert("Passwords do not match.");

    return;
  }

  //=========================
  // LOCAL STORAGE
  //=========================

  const user = {
    firstName: first,

    lastName: last,

    email: email,

    password: password,
  };

  localStorage.setItem(
    "fundTogetherUser",

    JSON.stringify(user),
  );

  alert("Sign In information saved successfully.");

  signinForm.reset();

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("signinModal"),
  );

  modal.hide();
});

/*====================================================

        LOAD SAVED USER

====================================================*/

const savedUser = JSON.parse(localStorage.getItem("fundTogetherUser"));

if (savedUser) {
  document.getElementById("firstName").value = savedUser.firstName || "";

  document.getElementById("lastName").value = savedUser.lastName || "";

  document.getElementById("email").value = savedUser.email || "";
}

/*====================================================

        SEARCH FILTER

====================================================*/

const searchInput = document.querySelector(".search-box input");

const fundraiserCard = document.querySelector(".campaign-card");

const profileCard = document.querySelector(".profile-card");

searchInput.addEventListener("keyup", function () {
  const keyword = this.value.toLowerCase();

  const campaign = fundraiserCard.innerText.toLowerCase();

  const profile = profileCard.innerText.toLowerCase();

  fundraiserCard.style.display = campaign.includes(keyword) ? "block" : "none";

  profileCard.style.display = profile.includes(keyword) ? "flex" : "none";
});

/*====================================================

        PART 3 CONTINUES...

====================================================*/

/*====================================================

        CREATE CAMPAIGN
        PART 3

====================================================*/

const campaignForm = document.getElementById("campaignForm");

campaignForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("campaignTitle").value.trim();

  const category = document.getElementById("campaignCategory").value;

  const story = document.getElementById("campaignStory").value.trim();

  const documentFile = document.getElementById("campaignDocument").files[0];

  //=========================
  // VALIDATION
  //=========================

  if (title === "" || category === "" || story === "" || !documentFile) {
    alert("Please fill all fields properly.");

    return;
  }

  const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

  if (!allowed.includes(documentFile.type)) {
    alert("Only PDF or Image files are allowed.");

    return;
  }

  //=========================
  // READ FILE
  //=========================

  const reader = new FileReader();

  reader.onload = function () {
    const campaign = {
      title: title,

      category: category,

      story: story,

      fileName: documentFile.name,

      fileType: documentFile.type,

      fileData: reader.result,

      created: new Date().toLocaleString(),
    };

    let campaigns =
      JSON.parse(localStorage.getItem("fundTogetherCampaigns")) || [];

    campaigns.push(campaign);

    localStorage.setItem(
      "fundTogetherCampaigns",

      JSON.stringify(campaigns),
    );

    alert(
      "Campaign submitted successfully.\n\nIt is now waiting for AI & Human Verification.",
    );

    campaignForm.reset();

    showPage(homePage);
  };

  reader.readAsDataURL(documentFile);
});

/*====================================================

        LOAD CAMPAIGNS

====================================================*/

const savedCampaigns = JSON.parse(
  localStorage.getItem("fundTogetherCampaigns"),
);

if (savedCampaigns) {
  console.log(
    "Saved Campaigns",

    savedCampaigns,
  );
}

/*====================================================

        SMALL ENHANCEMENTS

====================================================*/

// ENTER SEARCH

searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
  }
});

// ESC CLOSES MODALS

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document
      .querySelectorAll(".modal.show")

      .forEach(function (modal) {
        bootstrap.Modal.getInstance(modal)?.hide();
      });
  }
});

// AUTO FOCUS SIGNIN

document
  .getElementById("signinModal")

  .addEventListener("shown.bs.modal", function () {
    document.getElementById("firstName").focus();
  });

// FILE NAME DISPLAY

document
  .getElementById("campaignDocument")

  .addEventListener("change", function () {
    if (this.files.length) {
      console.log(
        "Selected:",

        this.files[0].name,
      );
    }
  });

// RESET SEARCH WHEN PAGE OPENS

function resetSearch() {
  searchInput.value = "";

  fundraiserCard.style.display = "block";

  profileCard.style.display = "flex";
}

/*====================================================

        OPTIONAL PAGE RESET

====================================================*/

searchBtn.addEventListener("click", resetSearch);

heroSearchBtn.addEventListener("click", resetSearch);

/*====================================================

        END OF SCRIPT.JS

====================================================*/
