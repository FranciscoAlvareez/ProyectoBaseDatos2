import express from "express";
import { registrarVoto, getListas, verificarVoto, registrarVotoObservado, listarVotosObservados, aprobarVotoObservado, getCircuitosPorEstablecimiento } from "../Controllers/voteController.js";

const router = express.Router();

router.post("/", registrarVoto);
router.get("/verificar", verificarVoto);
router.get("/listas", getListas);
router.post("/observed", registrarVotoObservado);
router.get("/observed/:id_establecimiento", listarVotosObservados);
router.put("/approve/:id_voto", aprobarVotoObservado);
router.get("/circuitos/:id_establecimiento", getCircuitosPorEstablecimiento);

export default router;
