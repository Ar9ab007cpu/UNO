import mongoose from "mongoose";
import crypto from "crypto";

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

        playerName: {
            type: String,
            default: "Player",
        },

        playerAvatar: {
            type: String,
            default: "/avatars/player-1.svg",
        },

        computerHand: {
            type: [cardSchema],
            default: [],
        },

        computerName: {
            type: String,
            default: "Nattu Kaka",
        },

        computerAvatar: {
            type: String,
            default: "/avatars/nattu-kaka.svg",
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

const games = new Map();

const cloneData = (data) =>
    JSON.parse(JSON.stringify(data));

const isMongoConnected = () =>
    mongoose.connection.readyState === 1;

class MemoryGame {
    constructor(data) {
        Object.assign(
            this,
            {
                playerHand: [],
                playerName: "Player",
                playerAvatar: "/avatars/player-1.svg",
                computerHand: [],
                computerName: "Nattu Kaka",
                computerAvatar: "/avatars/nattu-kaka.svg",
                drawPile: [],
                discardPile: [],
                currentColor: "",
                currentTurn: "player",
                winner: "",
                gameStatus: "playing",
                unoCalled: false,
                pendingDraw: 0,
                pendingDrawType: "",
                lastAction: "",
            },
            data
        );
    }

    async save() {
        this.updatedAt = new Date();

        games.set(
            String(this._id),
            cloneData(this)
        );

        return this;
    }
}

const createMemoryGame = async (data) => {
    const now = new Date();

    const game =
        new MemoryGame({
            _id: crypto.randomUUID(),
            ...cloneData(data),
            createdAt: now,
            updatedAt: now,
        });

    games.set(
        String(game._id),
        cloneData(game)
    );

    return game;
};

const findMemoryGameById = async (id) => {
    const game = games.get(
        String(id)
    );

    if (!game) {
        return null;
    }

    return new MemoryGame(
        cloneData(game)
    );
};

const GameStore = {
    create(data) {
        if (isMongoConnected()) {
            return Game.create(data);
        }

        return createMemoryGame(data);
    },

    findById(id) {
        if (isMongoConnected()) {
            return Game.findById(id);
        }

        return findMemoryGameById(id);
    },
};

export default GameStore;
