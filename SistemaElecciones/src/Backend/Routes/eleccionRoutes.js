import express from "express";
import { obtenerEleccionActiva, createElection } from "../Controllers/eleccionController.js";

const router = express.Router();

router.get("/eleccion/activa", obtenerEleccionActiva);
router.post("/election", createElection);

export default router;
