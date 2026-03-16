const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createToken = (userId) => jwt.sign(
  { id: userId },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const trimmedName = name?.trim();

    if (!trimmedName || !normalizedEmail || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      token: createToken(user._id),
      user: user.toPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to register user"
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      token: createToken(user._id),
      user: user.toPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to log in"
    });
  }
};

exports.getAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    res.json({
      message: "Account details fetched successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch account details"
    });
  }
};
