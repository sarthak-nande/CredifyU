import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    attempts: {
        type: Number,
        default: 0,
        max: 3
    }
}, {
    timestamps: true
});

// TTL index for automatic expiration after 5 minutes
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

// Method to increment attempts
otpSchema.methods.incrementAttempts = function() {
    this.attempts += 1;
    return this.save();
};

// Static method to find valid OTP
otpSchema.statics.findValidOTP = function(email) {
    return this.findOne({ 
        email: email.toLowerCase(),
        attempts: { $lt: 3 }
    });
};

// Static method to cleanup expired OTPs
otpSchema.statics.cleanupExpired = function() {
    return this.deleteMany({
        createdAt: { $lt: new Date(Date.now() - 5 * 60 * 1000) }
    });
};

export default mongoose.model('Otp', otpSchema);