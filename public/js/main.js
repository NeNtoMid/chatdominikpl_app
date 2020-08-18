const socket = io();
console.log(' socket:', socket);

const width =
  window.innerWidth > 0 ? window.innerWidth : screen.width;
console.log('width:', width);

let htmlCode = null;

let whichStylesheet = 'pc';

if (width >= 1000) {
  htmlCode = ` <article class="article">
  <div class="button">
    <a href="/" class="buttonlink">
      <span class="button__mask"></span>
      <span class="button__text">Left room</span>
      <span class="button__text button__text--bis">Left room</span></a>
  </div>
  <h1 id="roomname" class="roomname"></h1>
  <h1 class="userstitle">Users:</h1>
  <ul id="users" class="userslist"></ul>
</article>





<ul class="chat-thread" id="chat-messages"></ul>
<form class="chat-window" id="chat-form">
  <input class="chat-window-message" name="chat-window-message" type="text" autocomplete="off" autofocus
    id="chat-input" />
</form>`;
} else if (width < 1280) {
  htmlCode = `  


<article class="article">
  <div class="article__menu">
    <div class="article__hamburger"></div>
    <div class="article__hamburger"></div>
    <div class="article__hamburger"></div>
  </div>

  <ul class="article__list">
    <li class="article__limark"> &#x274C; &nbsp;</li>
   
    <li>
      <h1 id="roomname" class="roomname"></h1>
    </li>
    <li>
    <div class="article__div">
    <div class="button">
        <a href="/" class="buttonlink">
          <span class="button__mask"></span>
          <span class="button__text">Left room</span>
          <span class="button__text button__text--bis">Left room</span></a>
      </div>
    </div>
      
    </li>
    <li>&nbsp;</li>
    <li>&nbsp;</li>
    <li>&nbsp;</li>
    <li>&nbsp;</li>
    <li>&nbsp;</li>
    <li>&nbsp;</li>
    <li>&nbsp;</li>
    <li>&nbsp;</li>
    <li>&nbsp;</li>
    <li>&nbsp;</li>
    <li>&nbsp;</li>
    <li>
    
      <h1 class="userstitle">Users:</h1>
    </li>

    <li>
    <div class="article__div">
   
    <ul id="users" class="userslist"></ul>
    </div>
    </li>
  </ul>




</article>



<ul class="chat-thread" id="chat-messages"></ul>
<form class="chat-window" id="chat-form">
  <input class="chat-window-message" name="chat-window-message" type="text" autocomplete="off" autofocus
    id="chat-input" />
</form>
`;

  whichStylesheet = 'mobile';
}

document.body.insertAdjacentHTML('beforeend', htmlCode);
document.head.insertAdjacentHTML(
  'beforeend',
  `<link rel="stylesheet" href="/css/${
    whichStylesheet === 'pc' ? 'chat-pc' : 'chat-mobile'
  }.css"/>
  <link rel="stylesheet" href="/css/${
    whichStylesheet === 'pc' ? 'main-pc' : 'main-mobile'
  }.css"/>
  `
);

/* ---------------------------- Document querying --------------------------- */

const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById(
  'chat-messages'
);

const chatName = document.getElementById('roomname');

const usersList = document.getElementById('users');

const joinBtn = document.getElementById('main__joinbtn');

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit('joinRoom', { username, room });

/* ---------------------------------- Events --------------------------------- */

const hamburgerMenu = document.querySelector(
  '.article__menu'
);

if (hamburgerMenu) {
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
}

/* ---------------------------- Socket middleware --------------------------- */

socket.on('message', (message) => {
  chatMessages.scrollTop = chatMessages.scrollHeight;
  outputMessage(message, 'normal');
});

socket.on('roomUsers', ({ room, users }) => {
  chatName.innerText = room;

  usersList.innerHTML = `
  ${users
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
  if (chatInput.value !== '') {
    console.log('chatInput.value:', chatInput.value);
    socket.emit('add-message', chatInput.value);

    chatInput.value = '';

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
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
