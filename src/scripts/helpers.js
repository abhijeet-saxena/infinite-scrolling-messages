export const getRandomTimestamp = () => {
  const time = Math.floor(Math.random() * 22);
  let unit = Math.floor(Math.random() * 2) ? "hour" : "minute";

  if (time === 0) return "Just Now";
  else if (time > 1) unit += "s";

  return `${time} ${unit} ago`;
};
