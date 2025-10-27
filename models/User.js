const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  mobile: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"]
  },
  role: { 
    type: String, 
    enum: ["admin", "subadmin", "user"], 
    default: "user" 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
