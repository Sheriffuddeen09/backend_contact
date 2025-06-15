import cors from "cors";
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const product = express();
const PORT = 5000;
const PRODUCTS_JSON = "./product.json";

// ✅ Middleware to handle CORS and JSON
product.use(cors());
product.use(express.json());

const readProduct = () => {
  try {
    const data = fs.readFileSync(PRODUCTS_JSON, "utf-8");
    return JSON.parse(data || "[]");
  } catch {
    return [];
  }
};

const writeProduct = (data) =>
  fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(data, null, 2));

// ✅ GET all products
product.get("/api/product", (req, res) => {
  const products = readProduct();
  res.json(products);
});

// ✅ POST new product
const upload = multer(); // if using FormData
product.post("/api/product", upload.none(), (req, res) => {
  try {
    const { name, email, phone, message, type, time } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const products = readProduct();
    const exists = products.some(
      (p) => p.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (exists) {
      return res
        .status(409)
        .json({ error: "A product with this name already exists." });
    }

    const newProduct = {
      id: Date.now(),
      name,
      message,
      time,
      type,
      phone,
      email,
    };

    products.push(newProduct);
    writeProduct(products);

    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    console.error("❌ Error creating product:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ DELETE product by ID
product.delete("/api/product/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const products = readProduct();

  const newProducts = products.filter((p) => p.id !== id);

  if (products.length === newProducts.length) {
    return res.status(404).json({ error: "Product not found" });
  }

  writeProduct(newProducts);
  res.json({ message: "Product deleted successfully" });
});

// ✅ Start server
product.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);
