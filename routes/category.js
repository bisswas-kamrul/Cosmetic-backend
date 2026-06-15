const express = require("express");
const multer  = require('multer')
const upload = require ("../middlewareFloder/imgupload");
const createCategory = require("../controllersFloder/createCategory");
const categoryGetContollar = require("../controllersFloder/categoryGetContollar");
const categoryDeleteContollar = require("../controllersFloder/categoryDeleteContollar");
const categoryUpdeteContollar = require("../controllersFloder/categoryUpdeteContollar");
const protect = require("../middlewareFloder/authMiddleware");
const admin = require("../middlewareFloder/admin");
const categoryrouter = express.Router();

categoryrouter.post("/CategoryCreat" , protect, admin, upload.single ('image'), createCategory)
categoryrouter.get("/Show" , categoryGetContollar)
categoryrouter.post("/Delete/:id" , protect, admin, categoryDeleteContollar)
categoryrouter.put("/Updete/:id" , protect, admin, upload.single('image'), categoryUpdeteContollar)

module.exports = categoryrouter
