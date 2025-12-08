import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { StatsController } from "./stats.controller";

const router = express.Router();

router.get(
    "/sender",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.TOURIST),
    StatsController.getSenderStats
);
router.get(
    "/receiver",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.GUIDE),
    StatsController.getReceiverStats
);
router.get(
    "/user",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getUserStats
);

export const StatsRoutes = router;
