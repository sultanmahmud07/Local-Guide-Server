import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";

const router = Router()

router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser)
router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers)
router.get("/all-admin", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllAdmin)
router.get("/deleted-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllDeletedUsers)
router.get("/unauthor-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUnauthorizedUsers)
router.get("/all-sender", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllSender)
router.get("/all-receiver", checkAuth(...Object.values(Role)), UserControllers.getAllReceiver)
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe)
router.get("/:id", checkAuth(...Object.values(Role)), UserControllers.getSingleUser)
router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser)

export const UserRoutes = router