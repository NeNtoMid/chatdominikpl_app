const socket = io();

const chatForm = document.getElementById(`chat-form`);
const chatInput = document.getElementById(`chat-input`);
const chatMessages = document.getElementById(`chat-messages`);
const chatName = document.getElementById(`roomname`);
const usersList = document.getElementById(`users`);

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit(`joinRoom`, { username, room });

socket.on(`message`, (message) => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
  outputMessage(message, `normal`);
});

socket.on(`roomUsers`, ({ room, users }) => {
  chatName.innerText = room;
  usersList.innerHTML = `
  ${users
    .map((cur) => {
      return `<li>${cur.username}</li>`;
    })
    .join('')}
    
    
    `;
});

socket.on(`my-message`, (message) => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
  outputMessage(message, `my-message`);
});

chatForm.addEventListener(`submit`, (e) => {
  e.preventDefault();

  socket.emit(`add-message`, chatInput.value);

  chatInput.value = ``;

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

const outputMessage = (message, classOfLi = ``) => {
  const htmlCode = `
    <li class='${classOfLi}'>
        <p>${message.username} ${message.time} </p>
        <p>${message.message}</p>
       
    </li>
   `;
  chatMessages.insertAdjacentHTML('beforeend', htmlCode);
};
