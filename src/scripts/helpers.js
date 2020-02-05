export const setTimeInStatusBar = element => {
  const hours = new Date().getHours();
  const minutes = new Date().getMinutes();
  document.querySelector(".time").innerHTML = `${hours}:${minutes}`;
};

export const generateMessageCardsHTML = messageList => {
  const getRandomTimestamp = () => {
    const time = Math.floor(Math.random() * 22);
    let unit = Math.floor(Math.random() * 2) ? "hour" : "minute";

    if (time === 0) return "A few moments ago";
    else if (time > 1) unit += "s";

    return `${time} ${unit} ago`;
  };

  let cardsFragment = "";

  for (let i = 0; i < messageList.length; i++) {
    let {
      content,
      id,
      author: { name, photoUrl }
    } = messageList[i];

    cardsFragment += `
    <div class="card" id="${id}">
      <div class="lead">
        <img class="avatar" width="40" alt="${name} Avatar" height="40" src="https://message-list.appspot.com${photoUrl}"/>      
        <div class="author-data">
          <h4>${name}</h4>
          <span> ${getRandomTimestamp()} </span>
        </div>
      </div>
      <div class="message">
      ${content.length < 200 ? content : `${content.slice(0, 200)}...`}
      </div>
    </div>
    `;
  }

  return cardsFragment;
};
