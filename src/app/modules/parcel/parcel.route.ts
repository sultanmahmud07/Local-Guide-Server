import { Router } from "express";
import { Role } from "../user/user.interface";
import { createParcelZodSchema, updateParcelStatusZodSchema } from "./parcel.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { ParcelController } from "./parcel.controller";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.SENDER),
  validateRequest(createParcelZodSchema),
  ParcelController.createParcel
);

router.get("/all-parcel", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.getParcelsByAdmin);
router.get("/sender", checkAuth(Role.SENDER), ParcelController.getSenderParcels);
router.get("/receiver", checkAuth(Role.RECEIVER), ParcelController.getReceiverParcels);
router.get("/history", checkAuth(Role.RECEIVER), ParcelController.getDeliveryHistory);
router.get("/:id", checkAuth(...Object.values(Role)), ParcelController.getParcelById);
router.get("/tracking-id/:id", ParcelController.getParcelByTrackingId);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.SENDER), ParcelController.deleteParcel);

router.patch("/cancel/:id", checkAuth(Role.SENDER), ParcelController.cancelParcel);
router.patch("/delivery/:id", checkAuth(Role.RECEIVER), ParcelController.deliveryParcelByReceiver);
router.patch("/block/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.parcelBlockAndUnblock);
router.patch("/assign/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.assignDeliveryPersonnel);
router.patch(
  "/status/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateParcelStatusZodSchema),
  ParcelController.updateParcelStatus
);

export const ParcelRoutes = router;
