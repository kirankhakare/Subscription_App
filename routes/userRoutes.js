const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.get("/", getAllUsers);

// Update user (role and/or active status)
router.patch("/:id", updateUser);

// Delete user
router.delete("/:id", deleteUser);



module.exports = router;
