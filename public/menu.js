// menu.js
const hamburgerButton = document.getElementById("hamburger");
const menuLinks = document.getElementById("links");

hamburgerButton.addEventListener("click", () => {
    menuLinks.classList.toggle("hidden"); // Toggle visibility of the menu links
});


//! Working on changing the bars to an "X" when the menu is active

// hamburger.addEventListener("click", changeMenuState); // When hamburger is clicked, it changes into menu or x


// function changeMenuState() {
// 	hamburger.classList.toggle("active");
// }

