import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { createTourZodSchema, updateTourZodSchema } from "./tour.validation";
import { TourController } from "./tour.controller";
import { multerUpload } from "../../config/multer.config";

const router = Router();

// Create Tour (GUIDE, ADMIN)
router.post(
  "/create",
  checkAuth(Role.GUIDE, Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  validateRequest(createTourZodSchema),
  TourController.createTour
);

router.patch(
  "/:id",
  checkAuth(Role.GUIDE, Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  validateRequest(updateTourZodSchema),
  TourController.updateTour
);

// Search + Read
// router.get("/search", TourController.searchTours);
// router.get("/:id", TourController.getTourById);

export const TourRoutes = router;
