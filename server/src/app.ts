import cors from "cors";
import "dotenv/config";
import express from "express";
import router from "./routes/index.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Servidor funcionando" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
