import express from "express";
import { registerVoter } from "../Controllers/registerVoterController.js";

const router = express.Router();

router.post("/registerVoter", registerVoter);

export default router;
