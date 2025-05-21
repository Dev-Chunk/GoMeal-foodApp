const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItems', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String
}, { timestamps: true });

ratingSchema.index({ user: 1, foodItem: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
