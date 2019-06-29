const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 实例化数据模板
const PostSchema = new Schema({
  user: {
    type: String,
    required: true,
    ref: 'users'
  },
  text: {
    type: String,
    required: true
  },
  likes: [
    {
      user: Schema.Types.ObjectId,
      ref: 'users'
    }
  ],
  comments: [
    {
      date: {
        type: Date,
        defaul: Date.now
      },
      text: {
        type: String,
        require: true
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
      avatar: {
        type: String,
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Post = mongoose.model('post', PostSchema);