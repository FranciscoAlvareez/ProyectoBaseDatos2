import express from "express";
import { obtenerEleccionActiva } from "../Controllers/eleccionController.js";

const router = express.Router();

router.get("/eleccion/activa", obtenerEleccionActiva);

export default router;
