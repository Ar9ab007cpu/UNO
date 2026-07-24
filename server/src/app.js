import express from "express";
import cors from "cors";

import gameRoutes from "./routes/gameRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "UNO Game API is running"
    });
});

app.use("/api/game", gameRoutes);

export default app;