import express from "express";
import { createPartidoWithAutoridades } from "../Controllers/partidoController.js";

const router = express.Router();

router.post("/partido", createPartidoWithAutoridades);

export default router;
