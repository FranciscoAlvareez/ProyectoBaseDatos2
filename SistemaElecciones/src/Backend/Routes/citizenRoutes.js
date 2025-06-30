import express from "express";
import {
  getUnassignedCitizens,
  assignCitizenToCircuit
} from "../Controllers/citizenController.js";

const router = express.Router();

router.get("/ciudadanos-no-habilitados", getUnassignedCitizens);
router.post("/assignVoter", assignCitizenToCircuit);

export default router;
