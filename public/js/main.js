const socket = io();
console.log(' socket:', socket);

/* ---------------------------- Document querying --------------------------- */

const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById(
  'chat-messages'
);

const chatName = document.getElementById('roomname');

const chatNameMobile = document.getElementById(
  'roomname-mobile'
);
const usersList = document.getElementById('users');

const usersListMobile = document.getElementById(
  'users-mobile'
);

/* ---------------------------------- Events --------------------------------- */

const hamburgerMenu = document.querySelector(
  '.article__menu'
);

const menuList = document.querySelector('.article__list');

hamburgerMenu.addEventListener('click', (e) => {
  menuList.style.display = 'block';
  hamburgerMenu.style.display = 'none';
});

const switchOffMenu = document.querySelector(
  '.article__limark'
);

switchOffMenu.addEventListener('click', (e) => {
  menuList.style.display = 'none';
  hamburgerMenu.style.display = 'block';
});
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

/* ---------------------------- Socket middleware --------------------------- */

socket.emit('joinRoom', { username, room });

socket.on('message', (message) => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
  outputMessage(message, 'normal');
});

socket.on('roomUsers', ({ room, users }) => {
  chatName.innerText = room;
  chatNameMobile.innerText = room;

  usersList.innerHTML = `
  ${users
    .map((cur) => {
      return `<li>${cur.username}</li>`;
    })
    .join('')}
     `;

  usersListMobile.innerHTML = ` ${users
    .map((cur) => {
      return `<li>${cur.username}</li>`;
    })
    .join('')}
      `;
});

socket.on('my-message', (message) => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
  outputMessage(message, 'my-message');
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  socket.emit('add-message', chatInput.value);

  chatInput.value = '';

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
