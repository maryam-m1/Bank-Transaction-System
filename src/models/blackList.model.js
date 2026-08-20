const mongoose = require('mongoose');

const tokenBlackListSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 3 // 3 days in seconds
    }
});

// Check if the model already exists to prevent OverwriteModelError during hot reloads
const tokenBlackListModel = mongoose.models.TokenBlackList || mongoose.model('TokenBlackList', tokenBlackListSchema);

module.exports = tokenBlackListModel;