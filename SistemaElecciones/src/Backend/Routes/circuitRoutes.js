import { Router } from "express";
import {
  getCircuitsByEstablecimiento,
  getResultadosByCircuito,
} from "../Controllers/circuitController.js";

const router = Router();

router.get("/establecimiento/:id", getCircuitsByEstablecimiento);
router.get("/resultados/:id", getResultadosByCircuito);

export default router;
