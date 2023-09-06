// menu.js

let hamburger = document.getElementById("hamburger");
let links = document.getElementById("links");

hamburger.addEventListener("click", toggleHamburgerMenu);

// Toggle hamburger menu
function toggleHamburgerMenu() {
  hamburger.classList.toggle("active");
  links.classList.toggle("hidden");
}

// Close the dropdown if the user clicks outside of it
document.addEventListener("click", function (event) {
  if (!hamburger.contains(event.target) && !links.contains(event.target)) {
    hamburger.classList.remove("active");
    links.classList.add("hidden");
  }
});


// Recipes dropdown
const recipesButton = document.getElementById("recipesButton");
const recipeDropdown = document.getElementById("recipeDropdown");
const contentBelowDropdown = document.getElementById("contentBelowDropdown");

// Push contents below dropdown away when active and restore height when not active
function setMarginTop() {
  if (window.innerWidth <= 640 && !recipeDropdown.classList.contains("hidden")) {
    // Small screen with dropdown active
    contentBelowDropdown.style.marginTop = "115px"; // height of the dropdown menu
  } else {
    // All other cases
    contentBelowDropdown.style.marginTop = "0";
  }
}

// Set the margin-top initially
setMarginTop();

// Recalculate the margin-top when the window is resized
window.addEventListener("resize", setMarginTop);

recipesButton.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent the click event from triggering form submission
  recipeDropdown.classList.toggle("hidden"); // Toggle visibility of the menu links
    setMarginTop();

//   contentBelowDropdown.style.marginTop = recipeDropdown.classList.contains("hidden") ? "0" : "115px";

// Add an event listener to close the dropdown when clicking anywhere in the menu
  if (!recipeDropdown.classList.contains("hidden")) {
    document.addEventListener("click", closeDropdownOnClick);
  } else {
    document.removeEventListener("click", closeDropdownOnClick);
  }

});


 // Close the dropdown if the user clicks outside of it
document.addEventListener("click", function (event) {
    if (!recipesButton.contains(event.target) && !recipeDropdown.contains(event.target)) {
      recipeDropdown.classList.add("hidden");
      setMarginTop(); // Reset margin-top when the dropdown is closed
    document.removeEventListener("click", closeDropdownOnClick);
    }
});

