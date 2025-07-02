import express from "express";
import { createLista, getPartidos } from "../Controllers/listaController.js";

const router = express.Router();

router.post("/lista", createLista);
router.get("/lista/partidos", getPartidos);

export default router;
