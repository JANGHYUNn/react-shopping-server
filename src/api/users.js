import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { newToken } from '../utils/auth.js';
import { auth } from '../utils/auth';

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

export default router;
