let navButton = document.querySelector("#hamburger-container")
let navMenu = document.querySelector("#nav-bar-link-container")

let profileBtn = document.querySelector("#profile-container")
let profileMenu = document.querySelector("#profile-menu-container")
let profileImg = document.querySelector("#profile-drop-down-icon-img")

navButton.addEventListener("click", (e) => {
    if (navButton.classList.contains("ham-active")) {
        navButton.classList.remove("ham-active")
        navMenu.classList.add("nav-bar-link-container-hide")
    } else {
        navButton.classList.add("ham-active")
        navMenu.classList.remove("nav-bar-link-container-hide")
    }

    e.stopPropagation();
})


profileBtn.addEventListener("click", (e) => {
    if (profileMenu.classList.contains("profile-hide")) {
        profileMenu.classList.remove("profile-hide")
    } else {
        profileMenu.classList.add("profile-hide")
    }
    e.stopPropagation();
})

document.addEventListener('click', function (e) {
    // If click happens anywhere outside the popup & button, hide it
    let screenSize = window.innerWidth
    if (screenSize < 993) {
        if (!navMenu.classList.contains("nav-bar-link-container-hide")) {
            navMenu.classList.add("nav-bar-link-container-hide")
            navButton.classList.remove("ham-active")
        }
    }

    if (!profileMenu.classList.contains("profile-hide")) {
        profileMenu.classList.add("profile-hide")
    }
});

