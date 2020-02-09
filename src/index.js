import {
  setTimeInStatusBar,
  generateMessageCardsHTML
} from "./scripts/helpers";

setTimeInStatusBar();

// Global Variables
let token = "";
const loader = document.getElementById("loader");
const wrapper = document.querySelector(".card-wrapper");
const snackbar = document.querySelector(".snackbar");
const undoButton = document.querySelector(".action");

// Used for swipe functionality
let anchorX = 0;
let anchorY = 0;
let lastDismissedCardID = null;
let snackbarTimerID = null;

const options = {
  root: document.querySelector("main"),
  rootMargin: "400px 0px",
  threshold: 0
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(async entry => {
    setTimeInStatusBar();

    if (entry.isIntersecting) {
      loader.classList.add("active");
      token = await getMessagesFromAPI();
      loader.classList.remove("active");
    }
  });
}, options);

const getMessagesFromAPI = () => {
  return fetch(`https://message-list.appspot.com/messages?pageToken=${token}`)
    .then(res => res.json())
    .then(res => {
      wrapper.innerHTML += generateMessageCardsHTML(res.messages);
      if (!token) observer.observe(loader); // Activate observer on initial load only
      return res.pageToken;
    });
};

getMessagesFromAPI().then(data => {
  token = data;
  loader.classList.remove("active");
});

const touchStartHandler = event => {
  anchorX = event.changedTouches[0].clientX;
  anchorY = event.changedTouches[0].clientY;
};

const touchMoveHandler = event => {
  const clicked_card = event.target.closest(".card");
  if (clicked_card) {
    const displacementX = event.changedTouches[0].clientX - anchorX;
    const displacementY = event.changedTouches[0].clientY - anchorY;
    clicked_card.style.transitionDuration = "0ms";

    // Swiped in right direction — add transition and translateX card by the displacementX
    if (displacementX > 0 && Math.abs(displacementY) < 50) {
      if (!clicked_card.classList.contains("dismissing")) {
        clicked_card.closest(".card").classList.add("dismissing");
      }
      clicked_card.style.transform = `translateX(${displacementX}px)`;
    } else {
      clicked_card.style.transform = "translateX(0px)";
    }
  }
};

const touchEndHandler = event => {
  const clicked_card = event.target.closest(".card");
  clicked_card.classList.remove("dismissing");
  clicked_card.style.transitionDuration = "200ms";

  const displacementX = event.changedTouches[0].clientX - anchorX;
  if (displacementX > 100) {
    clicked_card.style.transform = "translateX(100vw)";

    if (snackbarTimerID && document.getElementById(lastDismissedCardID)) {
      wrapper.removeChild(document.getElementById(lastDismissedCardID));
      clearTimeout(snackbarTimerID);
    }

    setTimeout(() => {
      clicked_card.classList.add("dismissed");
      lastDismissedCardID = event.target.closest(".card").id;
    }, 200);

    snackbar.classList.add("show");

    snackbarTimerID = setTimeout(() => {
      snackbar.classList.remove("show");
      wrapper.removeChild(document.getElementById(lastDismissedCardID));
      lastDismissedCardID = null;
    }, 3000);
  } else {
    clicked_card.style.transform = "translateX(0px)";
  }
};

const handleDesktopDismiss = event => {
  if (event.target.classList.contains("dismiss")) {
    const clicked_card = event.target.closest(".card");
    clicked_card.style.transform = "translateX(100vw)";

    if (snackbarTimerID && document.getElementById(lastDismissedCardID)) {
      wrapper.removeChild(document.getElementById(lastDismissedCardID));
      clearTimeout(snackbarTimerID);
    }

    setTimeout(() => {
      clicked_card.classList.add("dismissed");
      lastDismissedCardID = event.target.closest(".card").id;
    }, 200);

    snackbar.classList.add("show");

    snackbarTimerID = setTimeout(() => {
      snackbar.classList.remove("show");
      wrapper.removeChild(document.getElementById(lastDismissedCardID));
      lastDismissedCardID = null;
    }, 3000);
  }
};

const undoActionHandler = () => {
  snackbar.classList.remove("show");
  if (snackbarTimerID) clearTimeout(snackbarTimerID);
  const lastDismissedMessage = document.getElementById(lastDismissedCardID);

  if (lastDismissedCardID) {
    lastDismissedMessage.classList.remove("dismissed");
    lastDismissedMessage.style.transitionDuration = "";
    lastDismissedMessage.style.transform = "";
    lastDismissedCardID = null;
  }
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
