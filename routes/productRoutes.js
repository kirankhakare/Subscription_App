const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { protect } = require("../middlewares/authMiddleware");
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getProductsBySubadmin,
  getAllProducts,
} = require("../controllers/productController");

// 🔐 Protected Routes (JWT required)
router.post("/", protect, upload.single("image"), addProduct);
router.put("/:id", protect, upload.single("image"), updateProduct);
router.delete("/:id", protect, deleteProduct);
router.get("/subadmin", protect, getProductsBySubadmin);
router.get("/all", getAllProducts);
module.exports = router;
