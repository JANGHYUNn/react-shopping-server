// lib
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
// import cors from 'cors';

// api
import docs from './utils/api-doc.js';
import users from './api/users.js';

const app = express();
const port = 5000;

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

// app.use(
//   cors({
//     origin: true,
//     preflightContinue: true,
//     credentials: true,
//   }),
// );

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
app.use('/api', users);

app.listen(port, () => {
  console.log(`listen Port : ${port}`);
});
