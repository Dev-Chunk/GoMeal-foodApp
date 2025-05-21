const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  imageUrl: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, trim: true },
  ratingCount: { type: Number, default : 0 },
  avgRating: { type: Number,  default : 0 },
}, { timestamps: true });

module.exports = mongoose.model('FoodItems', foodItemSchema);
