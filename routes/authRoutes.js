const express = require("express");
const router = express.Router();
const { register, login, getAccount } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/account", verifyToken, getAccount);

router.post("/register", register);
router.post("/login", login);

module.exports = router;
