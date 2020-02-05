//Global Variables
let token = "";
let time = document.querySelector(".time");
let loader = document.getElementById("loader");
let wrapper = document.querySelector(".card-wrapper");

//This all is needed for infinite scrolling
let options = {
  root: document.querySelector(".fixed-body"),
  rootMargin: "400px 0px",
  threshold: 0
};

let callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loader.classList.toggle("active");
      setTimeout(() => {
        getMessages();
        loader.classList.toggle("active");
      }, 500);
    }
  });
};

let observer = new IntersectionObserver(callback, options);

let generateCard = messageList => {
  messageList.forEach(msg => {
    let {
      content,
      id,
      author: { name, photoUrl }
    } = msg;
    let card = `
<div class="card" id="${id}">
  <div class="lead">
    <img class="avatar" width="40" height="40" src="http://message-list.appspot.com${photoUrl}"/>      
    <div class="author-data">
      <h4>${name}</h4>
      <span> ${Math.ceil(Math.random() * 30)} ${
      Math.floor(Math.random() * 2) ? "hours" : "minutes"
    } ago</span>
    </div>
  </div>
  <div class="message">
    ${content.length < 200 ? content : `${content.slice(0, 200)}...`}
   </div>
</div>
    `;
    wrapper.innerHTML += card;
  });
};

//Initialisation script
let getMessages = () => {
  fetch(`https://message-list.appspot.com/messages?pageToken=${token}`)
    .then(res => res.json())
    .then(res => {
      generateCard(res.messages);
      if (!token) observer.observe(loader);
      token = res.pageToken;
    });
};

getMessages();

// For swipe Animation
wrapper.addEventListener(
  "click",
  event => {
    let clicked_card = event.target.closest(".card");
    clicked_card.classList.add("dismissing");

    setTimeout(() => {
      clicked_card.classList.add("dismissed");
    }, 210);

    setTimeout(() => {
      clicked_card.classList.remove("dismissed");
      clicked_card.classList.remove("dismissing");
    }, 1000);
  },
  false
);

time.innerHTML = `${new Date().getHours()}:${new Date().getMinutes()}`;
