const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItems', required: true }
}, { timestamps: true });

wishlistSchema.index({ user: 1, foodItem: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
