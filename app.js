/* -------------------------------------------------------------------------- */
/*                                CORE MODULES                                */
/* -------------------------------------------------------------------------- */

const http = require('http');

const path = require('path');

/* -------------------------------------------------------------------------- */
/*                                 NPM MODULES                                */
/* -------------------------------------------------------------------------- */

const express = require('express');
const app = express();

const mongoose = require('mongoose');

const colors = require('colors');

const dotenv = require('dotenv');

dotenv.config({
  path: `./config/config.env`,
});

/* -------------------------------------------------------------------------- */
/*                                 OWN MODULES                                */
/* -------------------------------------------------------------------------- */

const User = require('./models/userM');

const msgFormater = require('./utils/createMessage');

const userCreator = require('./utils/user');

const mainRoutes = require('./routes/mainR');

/* ------------------------------ Engine Setup ------------------------------ */

app.set('views', 'views');
app.set('view engine', 'ejs');

/* ------------------------------- Middleware ------------------------------- */

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'images')));

app.use(mainRoutes);

/* --------------------------------- Server --------------------------------- */

mongoose
  .connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    const server = http.createServer(app);

    const io = require('socket.io')(server);

    server.listen(process.env.PORT || 3000, () => {
      console.log('Connected to Database!'.green);

      console.log('Connected to Server!'.green);
    });

    io.on('connection', (socket) => {
      console.log('Connected socket'.green.inverse);
      let user;

      socket.on('joinRoom', async ({ username, room }) => {
        const foundUser = await User.findOne({
          username,
          room,
        });
        if (!foundUser) {
          user = await userCreator(username, room);
        }

        socket.join(room);

        socket.emit(
          'message',
          msgFormater(
            'Admin',
            "Welcome to the Dominic's Chat ;)"
          )
        );

        const users = await User.find({ room });

        io.to(room).emit('roomUsers', { room, users });

        socket
          .to(room)
          .emit(
            `message`,
            msgFormater(
              `Admin`,
              `${username} says hello from chat!`
            )
          );

        socket.on(`add-message`, (message) => {
          socket.broadcast
            .to(room)
            .emit(
              `message`,
              msgFormater(username, message)
            );
          socket.emit(
            `my-message`,
            msgFormater(username, message)
          );
        });
      });

      socket.on('disconnect', async () => {
        if (user) {
          await User.findByIdAndDelete(user._id);

          socket
            .to(user.room)
            .emit(
              `message`,
              msgFormater(
                `Admin`,
                `${user.username} says goodbye from chat!`
              )
            );

          const users = await User.find({
            room: user.room,
          });

          io.to(user.room).emit('roomUsers', {
            room: user.room,
            users,
          });
        }
      });
    });
  })
  .catch((err) => console.log('From there' + err));

/* ----------------------------- Some reference ----------------------------- */
