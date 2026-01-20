const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters'],
        maxlength: [50, 'Name must not exceed 50 characters'],
        match: [/^[a-zA-Z\s]+$/, 'Name must contain only alphabetic letters and spaces']  // No integers/special chars
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['interviewer', 'candidate'],
        default: "candidate",

    },
    password: {
        type: String,
        required: true,


    }
},
    {
        timestamps: true
    }
)

const userModel = mongoose.model("user", userSchema)

module.exports = userModel;