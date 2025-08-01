import mongoose from "mongoose";

const User = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    year: { type: String, required: true },
    branch: { type: String, required: true },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true
    },
    token: {
        type: String,
    }
})

const Student = mongoose.model("Student", User);
export default Student;