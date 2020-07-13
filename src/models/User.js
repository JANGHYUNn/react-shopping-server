import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const saltRounds = 10;

// user schema
const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
    // required: true, 필수로 들어와야되는 값
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  // 관리자, 일반유저 구분 일반유저:0 관리자:1
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  // 토큰 유효기간
  tokenExp: {
    type: Number,
  },
});

// 유저 정보가 save 되기전에 처리하는 함수
// next() 하면 save함수로 이동함
userSchema.pre('save', function (next) {
  // 비밀번호를 생성, 변경일 때만 실행
  if (this.isModified('password')) {
    try {
      // 비밀번호 암호화 시킨다.
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(this.password, salt, (err, hash) => {
          if (err) return next(err);
          this.password = hash;
          next();
        });
      });
    } catch (err) {
      next(err.message);
    }
  } else {
    next();
  }
});

// schema를 모델로 감싸준다.
// mongoose.model(모델명, 스키마정보)
const User = mongoose.model('User', userSchema);

export default User;
