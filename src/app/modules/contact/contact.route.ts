import { Router } from "express";
import { ContactController } from "./contact.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/create", 
      // validateRequest(createContactValidation), 
      ContactController.createContact);

router.get("/all-contact",checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ContactController.getContactByAdmin);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ContactController.deleteContact);

export const ContactRoutes = router;
