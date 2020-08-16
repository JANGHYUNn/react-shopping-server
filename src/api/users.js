import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { newToken } from '../utils/auth.js';
import { auth } from '../utils/auth';
import Product from '../models/product.js';
import Payment from '../models/payment';
import async from 'async';

const router = Router();

// 회원가입
router.post('/register', (req, res) => {
  const newUser = new User(req.body);

  newUser.save((err, saved) => {
    if (err) res.status(409).send(err);
    else res.status(200).send(saved);
  });
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    // 사용자가 입력한 아이디가 맞는지 확인
    const user = await User.findOne({
      email: req.body.email,
    });
    // 아이디가 일치하지 않는다면 에러
    if (!user) return res.status(401).json('아이디가 없습니다.');

    // 아이디가 맞다면 비밀번호를 다시 암호화해서 db 비밀번호와 맞는지 확인
    bcrypt.compare(req.body.password, user.password, async (err, result) => {
      if (err) return res.status(500).json('Internal Server Error');

      if (!result) return res.status(401).json('비밀번호가 맞지 않습니다.');
      else {
        // 비밀번호가 일치하다면 토큰생성
        const token = newToken(user);

        // db에 토큰 저장
        user.token = token;
        await user.save(err => {
          if (err) return res.status(500).json('Internal Server Error');
        });
        // 토큰값을 쿠키에 저장한다.
        res.cookie('x_auth', token);
        console.log('1111');
        // 로그인 성공 응답
        res.status(200).json({
          loginSuccess: true,
          userInfo: {
            email: user.email,
            name: user.name,
            token: token,
          },
        });
        console.log('22222');
      }
    });
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
});

// 로그아웃
router.get('/logout', auth, (req, res) => {
  console.log(req.user);
  // 로그아웃시 db에 토큰값을 지워준다.
  User.findOneAndUpdate({ _id: req.user._id }, { token: '' }, err => {
    if (err) return res.status(500).send('Internal Server Error');
    return res.status(200).json({ sucess: true });
  });
});

// 인증
router.get('/auth', auth, (req, res) => {
  res.status(200).json({ ...req.user });
});

router.post('/addToCart', auth, (req, res) => {
  //먼저  User Collection에 해당 유저의 정보를 가져오기
  User.findOne({ _id: req.user._id }, (err, userInfo) => {
    // 가져온 정보에서 카트에다 넣으려 하는 상품이 이미 들어 있는지 확인

    let duplicate = false;
    userInfo.cart.forEach(item => {
      if (item.id === req.body.productId) {
        duplicate = true;
      }
    });

    //상품이 이미 있을때
    if (duplicate) {
      User.findOneAndUpdate(
        { _id: req.user._id, 'cart.id': req.body.productId },
        { $inc: { 'cart.$.quantity': 1 } },
        { new: true },
        (err, userInfo) => {
          if (err) return res.status(200).json({ success: false, err });
          res.status(200).send(userInfo.cart);
        },
      );
    }
    //상품이 이미 있지 않을때
    else {
      User.findOneAndUpdate(
        { _id: req.user._id },
        {
          $push: {
            cart: {
              id: req.body.productId,
              quantity: 1,
              date: Date.now(),
            },
          },
        },
        { new: true },
        (err, userInfo) => {
          if (err) return res.status(400).json({ success: false, err });
          res.status(200).send(userInfo.cart);
        },
      );
    }
  });
});

router.get('/removeFromCart', auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    {
      $pull: {
        cart: { id: req.query.id },
      },
    },
    { new: true },
    (err, userInfo) => {
      let cart = userInfo.cart;
      let array = cart.map(item => item.id);

      Product.find({ _id: { $in: array } })
        .populate('writer')
        .exec((err, productInfo) =>
          res.status(200).json({ productInfo, cart }),
        );
    },
  );
});

router.post('/successBy', auth, (req, res) => {
  // 간단한 결제정보 insert
  let history = [];
  let transactionData = {};

  req.body.cartDetail.forEach(item => {
    history.push({
      dateOfPurchase: Date.now(),
      name: item.title,
      id: item._id,
      price: item.price,
      quantity: item.quantity,
      paymentId: req.body.paymentData.paymentID,
    });
  });

  // payment collection 자세한 정보 insert
  transactionData.user = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  };

  transactionData.data = req.body.paymentData;
  transactionData.product = history;

  User.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { history }, $set: { cart: [] } },
    { new: true },
    (err, user) => {
      if (err) return res.json({ success: false, err });

      const payment = new Payment(transactionData);
      payment.save((err, doc) => {
        if (err) return res.json({ success: false, err });

        // sold 필드 업데이트

        let products = [];
        doc.product.forEach(item => {
          products.push({ id: item.id, quantity: item.quantity });
        });

        async.eachSeries(
          products,
          (item, callback) => {
            Product.update(
              { _id: item.id },
              { $inc: { sold: item.quantity } },
              { new: false },
              callback,
            );
          },
          err => {
            if (err) return res.status(400).json({ success: false, err });
            res.status(200).json({
              success: true,
              cart: user.cart,
              cartDetail: [],
            });
          },
        );
      });
    },
  );
});

export default router;
