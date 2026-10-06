import { Router } from "express";
import { restorationPlanController } from "../controllers/RestorationPlanController";

const router = Router();
router.get("/", restorationPlanController.list);
router.post("/", restorationPlanController.create);
router.post("/:id/submit", restorationPlanController.submit);
router.post("/:id/approve", restorationPlanController.approve);
router.post("/:id/reject", restorationPlanController.reject);
export default router;
