// Importing helper functions
import {
  setTimeInStatusBar,
  generateMessageCardsHTML
} from "./scripts/helpers";

// This function simply updates the timestamp in status bar
setTimeInStatusBar();

// Global Variables
let token = "";
const loader = document.getElementById("loader");
const wrapper = document.querySelector(".card-wrapper");
const snackbar = document.querySelector(".snackbar");

let lastDismissedCardID = null;
let snackbarTimerID = null;

// This all is needed for infinite scrolling
const options = {
  root: null,
  rootMargin: "400px 0px", // Trigger even before last element enters screen
  threshold: 0
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(async entry => {
    setTimeInStatusBar();

    // If loader is close to viewport, show loading spinner and load the next batch of messages
    if (entry.isIntersecting) {
      loader.classList.toggle("active");
      token = await getMessagesFromServer();
      loader.classList.toggle("active");
    }
  });
}, options);

// This function hits the API, render messages and returns the next pageToken
const getMessagesFromServer = () => {
  return fetch(`https://message-list.appspot.com/messages?pageToken=${token}`)
    .then(res => res.json())
    .then(res => {
      wrapper.innerHTML += generateMessageCardsHTML(res.messages);

      // Attach observer for the first time load only
      if (!token) observer.observe(loader);
      return res.pageToken;
    });
};

let anchorX = 0; // Used to store the startX of touch point
let anchorY = 0; // Used to store the startY of touch point

// Detect Touch Start — Set starting anchor points
wrapper.addEventListener(
  "touchstart",
  event => {
    anchorX = event.changedTouches[0].clientX;
    anchorY = event.changedTouches[0].clientY;
  },
  false
);

// Detect Touch Move — Animate the card
wrapper.addEventListener(
  "touchmove",
  event => {
    const clicked_card = event.target.closest(".card");
    const displacementX = event.changedTouches[0].clientX - anchorX;
    const displacementY = event.changedTouches[0].clientY - anchorY;

    // Set transition duration to 0ms for instant response on swiping
    clicked_card.style.transitionDuration = "0ms";

    if (displacementX > 0 && Math.abs(displacementY) < 50) {
      // Swiped in right direction — add transition and translateX card by the displacementX
      if (!clicked_card.classList.contains("dismissing")) {
        clicked_card.closest(".card").classList.add("dismissing");
      }
      clicked_card.style.transform = `translateX(${displacementX}px)`;
    } else {
      // Swiped in left direction — reset card position to left edge
      clicked_card.style.transform = "translateX(0px)";
    }
  },
  false
);

// Detect Touch End — Complete transition
wrapper.addEventListener(
  "touchend",
  event => {
    const clicked_card = event.target.closest(".card");
    clicked_card.classList.remove("dismissing");

    // Set transition duration to 200ms for smooth dismissal transition
    clicked_card.style.transitionDuration = "200ms";

    const displacementX = event.changedTouches[0].clientX - anchorX;

    // User must have swiped atleast 100px to prevent accidental swipes
    if (displacementX > 100) {
      clicked_card.style.transform = "translateX(100vw)";

      // Hide the card after swiping is complete and trigger snackbar
      setTimeout(() => {
        clicked_card.classList.add("dismissed");
        lastDismissedCardID = clicked_card.id;
        snackbar.classList.add("show");
      }, 200);

      // Auto dismiss snackbar after 3 seconds
      snackbarTimerID = setTimeout(() => {
        snackbar.classList.remove("show");
        wrapper.removeChild(clicked_card);
        lastDismissedCardID = null;
      }, 3000);
    } else {
      // Swiped in left direction — reset card position to left edge
      clicked_card.style.transform = "translateX(0px)";
    }
  },
  false
);

// Handle Undo click
document.querySelector(".action").addEventListener(
  "click",
  () => {
    snackbar.classList.remove("show");

    if (snackbarTimerID) clearTimeout(snackbarTimerID);

    if (lastDismissedCardID) {
      const lastDismisseddMessage = document.getElementById(
        lastDismissedCardID
      );

      //Bring back dismissed card in viewport
      lastDismisseddMessage.classList.remove("dismissed");
      lastDismisseddMessage.style.transitionDuration = "";
      lastDismisseddMessage.style.transform = "";
    }
  },
  false
);

// APP INITIAIZATION
getMessagesFromServer().then(token => token);
