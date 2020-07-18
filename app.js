/****************************/
/******* CORE MODULES *******/
/****************************/

const http = require('http');

const path = require('path');

/***************************/
/******* NPM MODULES *******/
/***************************/

const express = require('express');
const app = express();

const mongoose = require('mongoose');

/***************************/
/******* OWN MODULES *******/
/***************************/

const User = require('./models/userM');

const msgFormater = require('./utils/message');

const userCreator = require('./utils/user').createUser;

const mainRoutes = require('./routes/mainR');

/****************************/
/******* ENGINE SETUP *******/
/****************************/

app.set('views', 'views');
app.set('view engine', 'ejs');

/****************************/
/******* MIDDLEWARE *********/
/****************************/

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'images')));

app.use(mainRoutes);

/*************************/
/******* SERVER *********/
/************************/

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    const server = http.createServer(app);

    const io = require('socket.io')(server);

    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server created successfully!`);
    });

    io.on('connection', (socket) => {
      let user;
      //When user joins a room
      socket.on(`joinRoom`, async ({ username, room }) => {
        if (!(await User.findOne({ username: username }))) {
          user = await userCreator(username, room);
        }

        socket.join(room);
        //Welcome user
        socket.emit(
          `message`,
          msgFormater(`admin`, `Welcome to the Discord ;)`)
        );

        const users = await User.find({ room: room });

        io.to(room).emit(`roomUsers`, { room, users });

        socket
          .to(room)
          .emit(
            `message`,
            msgFormater(`admin`, `${username} has joined to chat!`)
          );

        socket.on(`add-message`, (message) => {
          socket.broadcast
            .to(room)
            .emit(`message`, msgFormater(username, message));
          socket.emit(`my-message`, msgFormater(username, message));
        });
      });

      socket.on(`disconnect`, async () => {
        //Delete user from database

        if (user) {
          await User.findByIdAndDelete(user._id);
          //Goodbye a user

          socket
            .to(user.room)
            .emit(
              `message`,
              msgFormater(`admin`, `${user.username} says goodbye from chat!`)
            );

          const users = await User.find({ room: user.room });

          io.to(user.room).emit(`roomUsers`, { room: user.room, users });
        }

        //Uptade users list on chat room
      });
    });
  })
  .catch((err) => console.log('From there' + err));
