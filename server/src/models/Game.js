import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
    {
        color: {
            type: String,
            required: true,
        },

        value: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            required: true,
        },
    },
    {
        _id: false,
    }
);

const gameSchema = new mongoose.Schema(
    {
        playerHand: {
            type: [cardSchema],
            default: [],
        },

        computerHand: {
            type: [cardSchema],
            default: [],
        },

        drawPile: {
            type: [cardSchema],
            default: [],
        },

        discardPile: {
            type: [cardSchema],
            default: [],
        },

        currentColor: {
            type: String,
            default: "",
        },

        currentTurn: {
            type: String,
            enum: ["player", "computer"],
            default: "player",
        },

        winner: {
            type: String,
            enum: ["", "player", "computer"],
            default: "",
        },

        gameStatus: {
            type: String,
            enum: ["playing", "finished"],
            default: "playing",
        },

        // =====================================
        // UNO
        // =====================================

        unoCalled: {
            type: Boolean,
            default: false,
        },

        // =====================================
        // DRAW STACK
        // =====================================

        pendingDraw: {
            type: Number,
            default: 0,
        },

        pendingDrawType: {
            type: String,
            enum: ["", "draw2", "wildDraw4"],
            default: "",
        },

        // =====================================
        // MESSAGE
        // =====================================

        lastAction: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Game = mongoose.model(
    "Game",
    gameSchema
);

export default Game;