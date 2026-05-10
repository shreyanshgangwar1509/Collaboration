import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password required only if not using Google login
        },
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function(next) {
    if (this.googleId && !this.password) return next(); // Skip if Google login and no password
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model.User || mongoose.model("User", userSchema);