import jwt from 'jsonwebtoken';
import userModel from '../models/User';

// 토큰 생성
export const newToken = user => {
  const payload = {
    _id: user._id,
  };
  return jwt.sign(payload, 'secretToken');
};

// 토큰을 복호화
export const jwtVerify = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, 'secretToken', (err, payload) => {
      if (err) {
        return reject(err);
      }
      resolve(payload);
    });
  });

// middleware
export const auth = async (req, res, next) => {
  if (!req.cookies.x_auth)
    return res.status(401).json({ message: 'token not defind', status: false });

  // 쿠키에 있는 토큰값 가져옴
  const token = req.cookies.x_auth;

  let payload;
  try {
    // 토큰을 복호화 하기위해
    payload = await jwtVerify(token);
  } catch (err) {
    return res.status(401).json('Invalid token');
  }
  // 복호화한 토큰으로 db에서 사용자 정보 찾기
  const user = await userModel
    .findById(payload._id)
    // 포함하거나 제외할 필드명
    .select('-password')
    // json 객체로 받아오기 위함
    .lean()
    .exec();

  if (!user)
    return res
      .status(401)
      .json({ message: 'user is not found', status: false });

  req.user = {
    ...user,
    status: true,
  };

  next();
};
