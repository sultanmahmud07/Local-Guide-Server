"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_config_1 = require("./cloudinary.config");
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_config_1.cloudinaryUpload,
    params: (req, file) => __awaiter(void 0, void 0, void 0, function* () {
        const originalName = file.originalname.toLowerCase();
        // extract name and extension
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
        // sanitize name
        const safeName = nameWithoutExt
            .replace(/\s+/g, "-") // spaces → dash
            // eslint-disable-next-line no-useless-escape
            .replace(/[^a-z0-9\-]/g, ""); // only keep alphanumeric and -
        const uniqueFileName = Math.random().toString(36).substring(2) +
            "-" +
            Date.now() +
            "-" +
            safeName;
        // ✅ get folder dynamically (example: from body or query)
        // const folderName = req.body || "alive_gadget"; // fallback to "default"
        // console.log("Folder Name:", folderName)
        return {
            folder: "local_guide", // ✅ Cloudinary folder
            public_id: uniqueFileName,
            resource_type: "auto", // good for images, pdf, etc
        };
    }),
});
exports.multerUpload = (0, multer_1.default)({ storage: storage });
