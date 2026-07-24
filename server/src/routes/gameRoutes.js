import express from "express";

import {
    startGame,
    getGame,
    playCard,
    drawCard,
    computerTurn,
    callUno,
} from "../controllers/gameController.js";

const router = express.Router();

router.post(
    "/start",
    startGame
);

router.get(
    "/:id",
    getGame
);

router.post(
    "/uno",
    callUno
);

router.post(
    "/play",
    playCard
);

router.post(
    "/draw",
    drawCard
);

router.post(
    "/computer",
    computerTurn
);

export default router;