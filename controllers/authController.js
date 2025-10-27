const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key"; // fallback for local dev

// 🟢 Register
exports.register = async (req, res) => {
  const { name, email, password, mobile } = req.body;

  // Validate input fields
  if (!name || !email || !password || !mobile) {
    return res.status(400).json({ message: "All fields (name, email, password, mobile) are required" });
  }

  // Validate mobile number format
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({ message: "Please enter a valid 10-digit mobile number" });
  }

  try {
    // Check if email or mobile already exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or mobile number already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      role: "user",
      isActive: true, // default active on registration
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟣 Login (with inactive user check)
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "All fields required" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    // Check if user is inactive
    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account is inactive. Please contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      role: user.role,
      name: user.name,
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
