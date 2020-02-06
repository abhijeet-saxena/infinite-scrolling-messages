export const setTimeInStatusBar = element => {
  const hours = new Date()
    .getHours()
    .toString()
    .padStart(2, "0");
  const minutes = new Date()
    .getMinutes()
    .toString()
    .padStart(2, "0");
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
    <article class="card" id="${id}">
      <div class="lead">
        <img class="avatar" width="40" alt="${name} Avatar" height="40" src="https://message-list.appspot.com${photoUrl}"/>      
        <div class="author-data">
          <h4>${name}</h4>
          <span class="timestamp"> ${getRandomTimestamp()} </span>
          <svg class="dismiss" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path class="dismiss" stroke="#7d7d7d" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg> 
        </div>
      </div>
      <p class="message">
      ${content.length < 200 ? content : `${content.slice(0, 200)}...`}
      </p>
    </article>
    `;
  }

  return cardsFragment;
};
