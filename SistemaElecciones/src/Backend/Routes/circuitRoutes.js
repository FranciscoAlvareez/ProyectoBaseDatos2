import { Router } from "express";
import {
  getCircuitsByEstablecimiento,
  getResultadosByCircuito,
  getResultadosGlobales,
} from "../Controllers/circuitController.js";

const router = Router();

router.get("/establecimiento/:id", getCircuitsByEstablecimiento);
router.get(
  "/resultados/:idCircuito/:idEstablecimiento",
  getResultadosByCircuito
);
router.get("/globales", getResultadosGlobales);

export default router;
