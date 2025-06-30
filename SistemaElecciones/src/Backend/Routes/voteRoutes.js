import express from "express";
import { registrarVoto, getListas, verificarVoto } from "../Controllers/voteController.js";

const router = express.Router();

router.post("/", registrarVoto);
router.get("/verificar", verificarVoto);
router.get("/listas", getListas);

export default router;
