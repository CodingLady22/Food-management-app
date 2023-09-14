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


//* Recipes and dashboard dropdown menus

const recipesButton = document.getElementById("recipesButton");
const recipeDropdown = document.getElementById("recipeDropdown");

const dashButton = document.getElementById("dashButton");
const dashDropdown = document.getElementById("dashDropdown");

const contentBelowDropdown = document.getElementById("contentBelowDropdown");
const contentBelowDashboard = document.getElementById("contentBelowDashboard");


// Push contents below dropdown away when active and restore height when not active
function setMarginTop() {
  const isRecipeDropdownActive = !recipeDropdown.classList.contains("hidden");
  const isDashDropdownActive = !dashDropdown.classList.contains("hidden");

  if (window.innerWidth <= 640 && (isRecipeDropdownActive || isDashDropdownActive)
  ) {
    // Small screen with either dropdown active
    if (isRecipeDropdownActive && isDashDropdownActive) {
      // Both dropdowns are active, set a higher margin value
      contentBelowDropdown.style.marginTop = "115px"; // Adjust the value as needed
      contentBelowDashboard.style.marginTop = "85px"; // Adjust the value as needed
    } else if (isRecipeDropdownActive) {
      // Only recipes dropdown is active, set the regular margin value
      contentBelowDropdown.style.marginTop = "115px";
      contentBelowDashboard.style.marginTop = "0px"; 
    } else {
      // Only dashboard dropdown is active, set the regular margin value
      contentBelowDropdown.style.marginTop = "0px"; 
      contentBelowDashboard.style.marginTop = "85px"; 
    }
  } else {
    // All other cases
    contentBelowDropdown.style.marginTop = "0";
    contentBelowDashboard.style.marginTop = "0"
  }
}

// Set the margin-top initially
setMarginTop();

// Recalculate the margin-top when the window is resized
window.addEventListener("resize", setMarginTop);


function toggleDropdown(dropdown, button) {
  dropdown.classList.toggle('hidden');
  setMarginTop(); // Update the margin-top value when any dropdown is toggled

  // Add an event listener to close the dropdown when clicking anywhere in the menu
  if (!dropdown.classList.contains("hidden")) {
    document.addEventListener("click", closeDropdownOnClick);
  } else {
    document.removeEventListener("click", closeDropdownOnClick);
  }
}

recipesButton.addEventListener("click", function (event) {
  event.preventDefault();
  toggleDropdown(recipeDropdown, recipesButton);
});

dashButton.addEventListener("click", function (event) {
  event.preventDefault();
  toggleDropdown(dashDropdown, dashButton);
});

function closeDropdownOnClick(event) {
  // Check if the click event is not on the recipesButton, dashButton, or their respective dropdowns
  if (
    !recipesButton.contains(event.target) &&
    !recipeDropdown.contains(event.target) &&
    !dashButton.contains(event.target) &&
    !dashDropdown.contains(event.target)
  ) {
    recipeDropdown.classList.add("hidden");
    dashDropdown.classList.add("hidden");
    setMarginTop(); // Reset margin-top when any dropdown is closed
    document.removeEventListener("click", closeDropdownOnClick);
  }
}




/* 
//* Undecided if to use client-side code to display recipe edit form or server-side code
// Function to toggle between recipe layout and edit form
     const toggleEditButton = document.getElementById("toggleEditButton");
    const editForm = document.getElementById("editForm");
    const recipeLayout = document.getElementById("recipeLayout");

    toggleEditButton.addEventListener("click", () => {
        if (editForm.classList.contains("hidden")) {
            editForm.classList.remove("hidden");
            recipeLayout.classList.add("hidden");
        } else {
            editForm.classList.add("hidden");
            recipeLayout.classList.remove("hidden");
        }
    });
*/