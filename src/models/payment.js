import mongoose from 'mongoose';

// const Schema = mongoose.Schema;

// product schema
const paymentSchema = mongoose.Schema(
  {
    user: {
      type: Array,
      default: [],
    },
    data: {
      type: Array,
      default: [],
    },
    product: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true },
);

// schema를 모델로 감싸준다.
// mongoose.model(모델명, 스키마정보)
const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
