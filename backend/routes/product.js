const router = require("express").Router();
const Product = require("../models/Product"); // ✅ IMPORTANT
const multer = require("multer");
const path = require("path");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "yarn-art-store", // The folder name in your Cloudinary account
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 }); // Recently added first
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// ADD NEW PRODUCT (Admin)
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, deliveryCharges } = req.body;
    let imageUrl = "/images/default.png"; // Fallback image if needed
    
    // Multer places the file URL in req.file.path when using Cloudinary Storage
    if (req.file) {
      imageUrl = req.file.path;
    }

    const newProduct = new Product({
      name,
      price: Number(price),
      category,
      deliveryCharges: Number(deliveryCharges || 0),
      image: imageUrl
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully!", product: newProduct });
  } catch (err) {
    console.error("Add Product Error:", err);
    res.status(500).json({ message: "Failed to add product" });
  }
});

// EDIT PRODUCT PRICE
router.put("/:id/price", async (req, res) => {
  try {
    const { price } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { price: Number(price) },
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Price updated successfully", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: "Error updating price" });
  }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

// PRODUCT DATA
const productsData = [
  {
    name: "Cute Crochet Teddy",
    price: 299,
    image: "/images/CuteCrochetTeddy.png",
    category: "Crochet Toys",
  },
  {
    name: "Handmade Yarn Rose",
    price: 199,
    image: "/images/YarnRose.png",
    category: "Yarn Flowers",
  },
  {
    name: "Woolen Handbag",
    price: 599,
    image: "/images/WoolenHandbag.png",
    category: "Yarn Bags",
  },
  {
    name: "Mini Keychain Doll",
    price: 149,
    image: "/images/MiniKeychainDoll.png",
    category: "Keychains",
  },
  {
    name: "Warm Knitted Sweater",
    price: 999,
    image: "/images/WarmKnittedSweater.png",
    category: "Sweaters",
  },
  {
    name: "Yarn Wall Hanging",
    price: 399,
    image: "/images/YarnWallHanging.png",
    category: "Home Decor",
  },
  {
    name: "Soft Crochet Bunny",
    price: 349,
    image: "/images/SoftCrochetBunny.png",
    category: "Crochet Toys",
  },
  {
    name: "Knitted Sunflower",
    price: 249,
    image: "/images/KnittedSunflower.png",
    category: "Yarn Flowers",
  },
  {
    name: "Stylish Yarn Purse",
    price: 699,
    image: "/images/beg.png",
    category: "Yarn Bags",
  },
  {
    name: "Cute Heart Keychain",
    price: 129,
    image: "/images/CuteHeartKeychain.png",
    category: "Keychains",
  },
  {
    name: "Winter Wool Sweater",
    price: 1199,
    image: "/images/WinterWoolSweater.png",
    category: "Sweaters",
  },
  {
    name: "Decor Yarn Basket",
    price: 449,
    image: "/images/DecorYarnBasket.png",
    category: "Home Decor",
  },
  {
    name: "Crochet Panda",
    price: 399,
    image: "/images/CrochetPanda.png",
    category: "Crochet Toys",
  },
  {
    name: "Yarn Tulip Set",
    price: 299,
    image: "/images/YarnTulipSet.png",
    category: "Yarn Flowers",
  },
  {
    name: "Handmade Sling Bag",
    price: 799,
    image: "/images/HandmadeSlingBag.png",
    category: "Yarn Bags",
  },
  {
    name: "Emoji Keychain",
    price: 99,
    image: "/images/EmojiKeychain.png",
    category: "Keychains",
  },
  {
    name: "Designer Sweater",
    price: 1399,
    image: "/images/DesignerSweater.png",
    category: "Sweaters",
  },
  {
    name: "Yarn Dream Catcher",
    price: 499,
    image: "/images/YarnDreamCatcher.png",
    category: "Home Decor",
  },
  {
    name: "Crochet Elephant",
    price: 459,
    image: "/images/CrochetElephant.png",
    category: "Crochet Toys",
  },
  {
    name: "Yarn Daisy Flower",
    price: 179,
    image: "/images/YarnDaisyFlower.png",
    category: "Yarn Flowers",
  },
];

router.post("/seedReal", async (req, res) => {
  try {
    const fs = require("fs");
    // Delete placeholders
    await Product.deleteMany({ image: { $regex: "placehold.co" } });

    const allFiles = fs.readdirSync("./public/images").filter(f => f.endsWith(".png") || f.endsWith(".jpg"));
    
    const usedImages = [
      "CuteCrochetTeddy.png", "YarnRose.png", "WoolenHandbag.png", "CuteHeartKeychain.png",
      "WarmKnittedSweater.png", "DecorYarnBasket.png", "SoftCrochetBunny.png", "YarnTulipSet.png",
      "HandmadeSlingBag.png", "EmojiKeychain.png", "DesignerSweater.png", "YarnDreamCatcher.png",
      "CrochetElephant.png", "YarnDaisyFlower.png"
    ];

    const unusedFiles = allFiles.filter(f => !usedImages.includes(f) && f !== "logo.png" && f !== "login-bg.jpg");

    const newProds = unusedFiles.map(f => {
      let cat = "Other";
      const lowerF = f.toLowerCase();
      
      if (lowerF.includes("bag")) cat = "Yarn Bags";
      else if (lowerF.includes("flower") || lowerF.includes("sunflower") || lowerF.includes("tulip") || lowerF.includes("rose")) cat = "Yarn Flowers";
      else if (lowerF.includes("keychain") || lowerF.includes("doll")) cat = "Keychains";
      else if (lowerF.includes("sweater") || lowerF.includes("cardigan")) cat = "Sweaters";
      else if (lowerF.includes("teddy") || lowerF.includes("panda") || lowerF.includes("bunny") || lowerF.includes("elephant")) cat = "Crochet Toys";
      else cat = "Home Decor";

      let name = f.replace(".png", "").replace(".jpg", "").replace(/([A-Z])/g, ' $1').trim() || "Handcrafted Product";
      if (name.toLowerCase() === "bag") name = "Classic Yarn Bag";
      if (name.toLowerCase() === "flower") name = "Knitted Flower Bouquet";
      if (name.toLowerCase() === "keychain") name = "Cute Fluffy Keychain";
      if (name.toLowerCase() === "sweater") name = "Standard Winter Sweater";
      if (name.toLowerCase() === "teddy") name = "Plush Crochet Teddy";

      return {
        name,
        category: cat,
        price: Math.floor(Math.random() * 800) + 199,
        image: `/images/${f}`
      };
    });

    if (newProds.length > 0) {
      await Product.insertMany(newProds);
    }
    
    res.json({ message: `Successfully cleared placeholders and added ${newProds.length} unused native images!`, added: newProds.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;