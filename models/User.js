const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    balance: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.toPublicProfile = function toPublicProfile() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    balance: this.balance,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model("User", userSchema);
