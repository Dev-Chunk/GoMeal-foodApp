const mongoose = require('mongoose');

const foodCategorySchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  imageUrl: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('FoodCategory', foodCategorySchema);
