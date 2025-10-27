const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;

/*Helper: Delete image from Cloudinary */
const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    // Example: https://res.cloudinary.com/demo/image/upload/v12345/products/abc123.jpg
    const parts = imageUrl.split("/");
    const folderAndFile = parts.slice(-2).join("/"); // e.g. products/abc123.jpg
    const publicId = folderAndFile.split(".")[0]; // e.g. products/abc123
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Failed to delete image from Cloudinary:", err.message);
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const addedBy = req.user?._id; //Auto-linked from JWT middleware

    if (!addedBy) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Validation
    if (!name || !price || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Product limit check — max 10 per subadmin
    const count = await Product.countDocuments({ addedBy });
    if (count >= 10) {
      return res
        .status(403)
        .json({ message: "Product limit (10) reached for this subadmin" });
    }

    const imageUrl = req.file.path;

    const product = await Product.create({
      name,
      price,
      description,
      image: imageUrl,
      addedBy,
    });

    res
      .status(201)
      .json({ message: "Product added successfully", product });
  } catch (err) {
    console.error("Error in addProduct:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const subadminId = req.user?._id;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check ownership
    if (product.addedBy.toString() !== subadminId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this product" });
    }

    const updates = {};
    if (name) updates.name = name;
    if (price) updates.price = price;
    if (description) updates.description = description;

    // If new image uploaded → delete old and replace
    if (req.file) {
      await deleteCloudinaryImage(product.image);
      updates.image = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Error in updateProduct:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const subadminId = req.user?._id;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Ownership check
    if (product.addedBy.toString() !== subadminId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this product" });
    }

    // Delete from Cloudinary
    await deleteCloudinaryImage(product.image);

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error in deleteProduct:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProductsBySubadmin = async (req, res) => {
  try {
    const subadminId = req.user?._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ addedBy: subadminId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ addedBy: subadminId });

    res.json({
      products,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error("Error in getProductsBySubadmin:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    // Fetch all products, populate addedBy with subadmin name if needed
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate("addedBy", "name mobile"); // optional: show subadmin info

    res.status(200).json({ products });
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};


