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
const undoButton = document.querySelector(".action");

let anchorX = 0; // Used to store the startX of touch point
let anchorY = 0; // Used to store the startY of touch point
let lastDismissedCardID = null;
let snackbarTimerID = null;

// This is needed for infinite scrolling functionality
const options = {
  root: document.querySelector("main"),
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

      // Activate observer for the first time load only
      if (!token) observer.observe(loader);
      return res.pageToken;
    });
};

// APP INITIAIZATION
getMessagesFromServer().then(data => {
  token = data;
});

// Detect Touch Start — Set starting anchor points
const touchStartHandler = event => {
  anchorX = event.changedTouches[0].clientX;
  anchorY = event.changedTouches[0].clientY;
};

// Detect Touch Move — Animate the card
const touchMoveHandler = event => {
  const clicked_card = event.target.closest(".card");
  if (clicked_card) {
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
  }
};

// Detect Touch End — Complete transition
const touchEndHandler = event => {
  const clicked_card = event.target.closest(".card");
  clicked_card.classList.remove("dismissing");

  // Set transition duration to 200ms for smooth dismissal transition
  clicked_card.style.transitionDuration = "200ms";

  const displacementX = event.changedTouches[0].clientX - anchorX;

  // User must have swiped atleast 100px to prevent accidental swipes
  if (displacementX > 100) {
    clicked_card.style.transform = "translateX(100vw)";

    if (snackbarTimerID && document.getElementById(lastDismissedCardID)) {
      wrapper.removeChild(document.getElementById(lastDismissedCardID));
      clearTimeout(snackbarTimerID);
    }

    // Hide the card after swiping is complete and trigger snackbar
    setTimeout(() => {
      clicked_card.classList.add("dismissed");
      lastDismissedCardID = event.target.closest(".card").id;
    }, 200);

    snackbar.classList.add("show");

    // Auto dismiss snackbar after 3 seconds & remove element form DOM
    snackbarTimerID = setTimeout(() => {
      snackbar.classList.remove("show");
      wrapper.removeChild(document.getElementById(lastDismissedCardID));
      lastDismissedCardID = null;
    }, 3000);
  } else {
    // Reset card position to left edge
    clicked_card.style.transform = "translateX(0px)";
  }
};

// Handle dismiss in Desktop view
const handleDesktopDismiss = event => {
  if (event.target.classList.contains("dismiss")) {
    const clicked_card = event.target.closest(".card");
    clicked_card.style.transform = "translateX(100vw)";

    if (snackbarTimerID && document.getElementById(lastDismissedCardID)) {
      wrapper.removeChild(document.getElementById(lastDismissedCardID));
      clearTimeout(snackbarTimerID);
    }

    // Hide the card after swiping is complete and trigger snackbar
    setTimeout(() => {
      clicked_card.classList.add("dismissed");
      lastDismissedCardID = event.target.closest(".card").id;
    }, 200);

    snackbar.classList.add("show");

    // Auto dismiss snackbar after 3 seconds & remove element form DOM
    snackbarTimerID = setTimeout(() => {
      snackbar.classList.remove("show");
      wrapper.removeChild(document.getElementById(lastDismissedCardID));
      lastDismissedCardID = null;
    }, 3000);
  }
};

// Handle Undo click
const undoActionHandler = () => {
  snackbar.classList.remove("show");
  if (snackbarTimerID) clearTimeout(snackbarTimerID);
  const lastDismissedMessage = document.getElementById(lastDismissedCardID);

  // Bring back dismissed card in viewport
  lastDismissedMessage.classList.remove("dismissed");
  lastDismissedMessage.style.transitionDuration = "";
  lastDismissedMessage.style.transform = "";

  lastDismissedCardID = null;
};

// Event Listeners
wrapper.addEventListener("touchstart", event => touchStartHandler(event), {
  passive: true
});
wrapper.addEventListener("touchmove", event => touchMoveHandler(event), {
  passive: true
});
wrapper.addEventListener("touchend", event => touchEndHandler(event), {
  passive: true
});
wrapper.addEventListener("click", event => handleDesktopDismiss(event), false);
undoButton.addEventListener("click", () => undoActionHandler(), false);
