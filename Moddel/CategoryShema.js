const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cetagorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  description: {
    type: String
  },
  images: [
    {
      type: String, // image URLs
    }
  ],
}, { timestamps: true });
module.exports = mongoose.model("CetagoryList", cetagorySchema);