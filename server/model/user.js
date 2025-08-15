import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const User = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        },
        require: true
    },
    password: {
        type: String,
        require: true
    },
    Name: {
        type: String,
        require: false
    },
    collegeName:{
        type: String,
        require: false
    },
    phone:{
        type: String,
        require: false
    },
    collegeAddress:{
        type: String,
        require: false
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    }
})

User.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

User.methods.getAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.EXPIRE_ACCESS_TOKEN
        }
    )
}

User.methods.getRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.EXPIRE_REFRESH_TOKEN
        }
    )
}

const UserModel = mongoose.model('UserModel', User);
export { UserModel };