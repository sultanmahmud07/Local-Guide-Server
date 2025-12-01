import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";


const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    const originalName = file.originalname.toLowerCase();

    // extract name and extension
    const nameWithoutExt =
      originalName.substring(0, originalName.lastIndexOf(".")) || originalName;

    // sanitize name
    const safeName = nameWithoutExt
      .replace(/\s+/g, "-") // spaces → dash
      // eslint-disable-next-line no-useless-escape
      .replace(/[^a-z0-9\-]/g, ""); // only keep alphanumeric and -

    const uniqueFileName =
      Math.random().toString(36).substring(2) +
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
  },
});



export const multerUpload = multer({ storage: storage })