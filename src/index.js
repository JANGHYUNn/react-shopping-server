// lib
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// api
import docs from './utils/api-doc.js';
import users from './api/users.js';
import { auth } from './utils/auth.js';

const app = express();
const port = 5000;

// bodyParser
// aplication/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// aplication/json
app.use(bodyParser.json());

// cookie parser
app.use(cookieParser());

// logged
app.use(morgan('dev'));

// db connected
mongoose
  .connect(
    'mongodb+srv://kjh2369:wkdgus23!@cluster0.ycc8l.mongodb.net/<dbname>?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
  )
  .then(() => {
    console.log('MongoDB Connected...');
  })
  .catch(err => {
    console.log(err);
  });

// api
app.use('/api', docs);
app.use('/', users);
app.use('/auth', auth);

app.listen(port, 'localhost', () => {
  console.log(`listen Port : ${port}`);
});
