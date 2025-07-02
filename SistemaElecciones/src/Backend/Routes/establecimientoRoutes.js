import express from "express";
import { getEstablecimientos } from "../Controllers/establecimientoController.js";

const router = express.Router();

router.get("/establecimientos", getEstablecimientos);

export default router;
