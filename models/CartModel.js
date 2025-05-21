const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItems', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
