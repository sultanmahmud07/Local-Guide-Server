import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { StatsController } from "./stats.controller";

const router = express.Router();

router.get(
    "/tourist",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.TOURIST),
    StatsController.getTouristStats
);
router.get(
    "/guide",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.GUIDE),
    StatsController.getGuideStats
);
router.get(
    "/admin",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getAdminStats
);

export const StatsRoutes = router;
