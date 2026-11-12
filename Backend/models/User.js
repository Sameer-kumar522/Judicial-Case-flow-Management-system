
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },

    role: {
      type: String,
      required: true,
      enum: ['Admin', 'Registrar', 'Judge', 'Clerk', 'Lawyer'],
      default: 'Clerk'
    },

    designation: {
      type: String,
      default: 'Judicial Staff'
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare entered password with stored password hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create User Model
const User = mongoose.model('User', userSchema);

module.exports = User;
