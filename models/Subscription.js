const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Can be an actual User _id OR 'admin'
    subscription: { type: Object, required: true } // The device data
});

module.exports = mongoose.model('Subscription', subscriptionSchema);