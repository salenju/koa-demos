const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  user: {
    type: String,
    ref: 'user',  // 关联到user表
    required: true
  },
  handle: {
    type: String,
    required: true,
    max: 60
  },
  company: {
    type: String
  },
  website: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  bio: {
    type: String
  },
  githubusername: {
    type: String
  },
  experience: [
    {
      current: {
        type: Boolean,
        default: true
      },
      title: {
        type: String,
        required: true
      },
      company: {
        type: String,
        required: true
      },
      location: {
        type: String
      },
      from: {
        type: String,
        required: true
      },
      to: {
        type: String
      },
      description: {
        type: String
      }
    }
  ],
  education: [
    {
      current: {
        type: Boolean,
        default: true
      },
      school: {
        type: String,
        required: true
      },
      degree: {
        type: String,
        required: true
      },
      fieldofstudy: {
        type: String,
      },
      from: {
        type: String,
        required: true
      },
      to: {
        type: String,
      },
      description: {
        type: String,
      },
    }
  ],
  social: {
    wechat: {
      type: String,
    },
    QQ: {
      type: String,
    },
    tengxunkt: {
      type: String,
    },
    wangyikt: {
      type: String,
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = profileModel = mongoose.model('profile', ProfileSchema);