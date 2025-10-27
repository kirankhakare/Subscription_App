const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user role and/or active status
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const updates = {};

    // Validate role if provided
    if (role) {
      const validRoles = ["admin", "subadmin", "user"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      updates.role = role;
    }

    // Validate isActive if provided
    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "Invalid status value" });
      }
      updates.isActive = isActive;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Prevent inactive user login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isActive === false) {
      return res.status(403).json({ message: "User account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.status(200).json({
      message: "Login successful",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user (optional, if frontend delete button used)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

