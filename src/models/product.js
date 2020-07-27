import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// product schema
const productSchema = mongoose.Schema(
  {
    writer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
      default: [],
    },
    sold: {
      type: Number,
      maxlength: 100,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    continents: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

productSchema.index(
  {
    title: 'text',
    description: 'text',
  },
  {
    weights: {
      title: 5, // 중요도
      discription: 1,
    },
  },
);

// schema를 모델로 감싸준다.
// mongoose.model(모델명, 스키마정보)
const Product = mongoose.model('Product', productSchema);

export default Product;
