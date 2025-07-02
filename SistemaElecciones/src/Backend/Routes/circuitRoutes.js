import { Router } from "express";
import {
  getCircuitsByEstablecimiento,
  getResultadosByCircuito,
  getResultadosGlobales,
  getResultadosPorDepartamento,
} from "../Controllers/circuitController.js";

const router = Router();

router.get("/establecimiento/:id", getCircuitsByEstablecimiento);
router.get(
  "/resultados/:idCircuito/:idEstablecimiento",
  getResultadosByCircuito
);
router.get("/globales", getResultadosGlobales);
router.get("/departamentos", getResultadosPorDepartamento);

export default router;
