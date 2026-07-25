import express from "express";
import { runAudit, getMyAudits } from "../controllers/auditController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, runAudit);
router.get("/history", protect, getMyAudits);

export default router;