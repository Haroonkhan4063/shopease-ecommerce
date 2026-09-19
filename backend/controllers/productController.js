const Product = require("../models/Product");
const { uploadBufferToCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryUpload");

// @desc    Create a product (seller only, must be approved)
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    if (!req.user.shopInfo?.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your seller account is not approved yet. Wait for admin approval.",
      });
    }

    const { name, description, price, discountPrice, category, stock } = req.body;

    if (discountPrice && Number(discountPrice) >= Number(price)) {
      return res.status(400).json({ success: false, message: "Discount price must be less than price" });
    }

    // req.files comes from multer (upload.array("images"))
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer);
        images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    const product = await Product.create({
      seller: req.user._id,
      name,
      description,
      price,
      discountPrice: discountPrice || null,
      category,
      stock,
      images,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active products (public, with basic filtering/search/pagination)
// @route   GET /api/products?keyword=&category=&page=&limit=
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.keyword) filter.$text = { $search: req.query.keyword };

    const [products, total] = await Promise.all([
      Product.find(filter).populate("seller", "name shopInfo.shopName").skip(skip).limit(limit).sort("-createdAt"),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by id (public)
// @route   GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller", "name shopInfo.shopName");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in seller's own products
// @route   GET /api/products/my-products
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort("-createdAt");
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product (owner seller or admin only)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const isOwner = product.seller.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this product" });
    }

    const updatableFields = ["name", "description", "price", "discountPrice", "category", "stock", "isActive"];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    // Optionally add new images on update
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBufferToCloudinary(file.buffer);
        product.images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    await product.save();
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product (owner seller or admin only) — also cleans up Cloudinary images
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const isOwner = product.seller.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this product" });
    }

    for (const image of product.images) {
      await deleteFromCloudinary(image.public_id).catch(() => {}); // don't fail the whole request over a cleanup error
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
