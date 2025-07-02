import express from "express";
import cors from "cors";
import registerVoterRoutes from "./Routes/registerVoterRoutes.js";
import authRoutes from "./Routes/auth.js";
import citizenRoutes from "./Routes/citizenRoutes.js";
import voteRoutes from "./Routes/voteRoutes.js";
import eleccionRoutes from "./Routes/eleccionRoutes.js";
import establecimientoRoutes from "./Routes/establecimientoRoutes.js";
import circuitRoutes from "./Routes/circuitRoutes.js";



const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", registerVoterRoutes);
app.use("/api", citizenRoutes);
app.use("/api/vote", voteRoutes);
app.use("/api", eleccionRoutes);
app.use("/api", establecimientoRoutes);
app.use('/api/circuitos', circuitRoutes);




app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
