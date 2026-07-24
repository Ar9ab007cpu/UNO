import Game from "../models/Game.js";

import {
    createDeck,
    shuffleDeck,
} from "../utils/deck.js";

import {
    canPlayCard,
    checkWinner,
} from "../services/gameLogic.js";


// ==========================================
// CONSTANTS
// ==========================================

const COLORS = [
    "red",
    "yellow",
    "green",
    "blue",
];


// ==========================================
// DRAW CARDS HELPER
// ==========================================

const drawCards = (
    game,
    hand,
    amount
) => {

    let cardsDrawn = 0;

    while (
        cardsDrawn < amount &&
        game.drawPile.length > 0
    ) {

        const card =
            game.drawPile.pop();

        hand.push(card);

        cardsDrawn++;
    }

    return cardsDrawn;
};


// ==========================================
// BEST COLOR FOR COMPUTER
// ==========================================

const getBestComputerColor = (
    hand
) => {

    let bestColor = "red";
    let bestCount = -1;

    COLORS.forEach((color) => {

        const count =
            hand.filter(
                (card) =>
                    card.color === color
            ).length;

        if (count > bestCount) {

            bestCount = count;
            bestColor = color;
        }
    });

    return bestColor;
};


// ==========================================
// START GAME
// ==========================================

export const startGame = async (
    req,
    res
) => {

    try {

        let deck = shuffleDeck(
            createDeck()
        );

        const playerHand =
            deck.splice(0, 7);

        const computerHand =
            deck.splice(0, 7);


        // Initial card must be number
        const firstCardIndex =
            deck.findIndex(
                (card) =>
                    card.type === "number"
            );


        const firstCard =
            deck.splice(
                firstCardIndex,
                1
            )[0];


        const game =
            await Game.create({

                playerHand,

                computerHand,

                drawPile: deck,

                discardPile: [
                    firstCard
                ],

                currentColor:
                    firstCard.color,

                currentTurn:
                    "player",

                winner: "",

                gameStatus:
                    "playing",

                unoCalled: false,

                pendingDraw: 0,

                pendingDrawType: "",

                lastAction:
                    "Game started. Your turn.",
            });


        res.status(201).json(game);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Unable to start game",
        });
    }
};


// ==========================================
// GET GAME
// ==========================================

export const getGame = async (
    req,
    res
) => {

    try {

        const game =
            await Game.findById(
                req.params.id
            );


        if (!game) {

            return res
                .status(404)
                .json({
                    message:
                        "Game not found",
                });
        }


        res.status(200).json(game);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Unable to get game",
        });
    }
};


// ==========================================
// CALL UNO
// ==========================================

export const callUno = async (
    req,
    res
) => {

    try {

        const { gameId } =
            req.body;


        const game =
            await Game.findById(
                gameId
            );


        if (!game) {

            return res
                .status(404)
                .json({
                    message:
                        "Game not found",
                });
        }


        if (
            game.gameStatus !==
            "playing"
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "Game has finished",
                });
        }


        if (
            game.currentTurn !==
            "player"
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "It is not your turn",
                });
        }


        if (
            game.playerHand.length !== 2
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "UNO is available when you have 2 cards",
                });
        }


        if (game.unoCalled) {

            return res
                .status(400)
                .json({
                    message:
                        "UNO already called",
                });
        }


        game.unoCalled = true;

        game.lastAction =
            "UNO called!";


        await game.save();


        res.status(200).json(game);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Unable to call UNO",
        });
    }
};


// ==========================================
// PLAYER PLAYS CARD
// ==========================================

export const playCard = async (
    req,
    res
) => {

    try {

        const {
            gameId,
            cardIndex,
            chosenColor,
        } = req.body;


        const game =
            await Game.findById(
                gameId
            );


        if (!game) {

            return res
                .status(404)
                .json({
                    message:
                        "Game not found",
                });
        }


        if (
            game.gameStatus !==
            "playing"
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "Game has finished",
                });
        }


        if (
            game.currentTurn !==
            "player"
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "It is not your turn",
                });
        }


        if (
            !Number.isInteger(
                cardIndex
            ) ||
            cardIndex < 0 ||
            cardIndex >=
                game.playerHand.length
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "Invalid card",
                });
        }


        const card =
            game.playerHand[
                cardIndex
            ];


        const topCard =
            game.discardPile[
                game.discardPile.length - 1
            ];


        // ======================================
        // CHECK PLAYABLE
        // ======================================

        const playable =
            canPlayCard(
                card,
                topCard,
                game.currentColor,
                game.pendingDraw,
                game.pendingDrawType
            );


        if (!playable) {

            if (game.pendingDraw > 0) {

                return res
                    .status(400)
                    .json({
                        message:
                            `You must stack ${game.pendingDrawType === "draw2" ? "+2" : "+4"} or draw ${game.pendingDraw} cards.`,
                    });
            }


            return res
                .status(400)
                .json({
                    message:
                        "You cannot play this card",
                });
        }


        // ======================================
        // VALIDATE WILD COLOR BEFORE REMOVAL
        // ======================================

        if (
            card.color === "wild" &&
            !COLORS.includes(
                chosenColor
            )
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "Choose red, yellow, green or blue",
                });
        }


        const hadTwoCards =
            game.playerHand.length === 2;

        const calledUno =
            game.unoCalled;


        // ======================================
        // REMOVE CARD
        // ======================================

        game.playerHand.splice(
            cardIndex,
            1
        );


        game.discardPile.push(
            card
        );


        // ======================================
        // COLOR
        // ======================================

        if (
            card.color === "wild"
        ) {

            game.currentColor =
                chosenColor;

        } else {

            game.currentColor =
                card.color;
        }


        // ======================================
        // +2
        // ======================================

        if (
            card.value === "draw2"
        ) {

            game.pendingDraw += 2;

            game.pendingDrawType =
                "draw2";

            game.currentTurn =
                "computer";

            game.lastAction =
                `You played Draw Two. Computer must stack +2 or draw ${game.pendingDraw} cards.`;
        }


        // ======================================
        // +4
        // ======================================

        else if (
            card.value ===
            "wildDraw4"
        ) {

            game.pendingDraw += 4;

            game.pendingDrawType =
                "wildDraw4";

            game.currentTurn =
                "computer";

            game.lastAction =
                `You played Wild Draw Four. Computer must stack +4 or draw ${game.pendingDraw} cards.`;
        }


        // ======================================
        // SKIP
        // Player blocks computer,
        // therefore player plays again.
        // ======================================

        else if (
            card.value === "skip"
        ) {

            game.currentTurn =
                "player";

            game.lastAction =
                "You played Skip. Computer was skipped. Play again.";
        }


        // ======================================
        // REVERSE
        // 2-player UNO => behaves as Skip
        // ======================================

        else if (
            card.value === "reverse"
        ) {

            game.currentTurn =
                "player";

            game.lastAction =
                "You played Reverse. Computer was skipped. Play again.";
        }


        // ======================================
        // NORMAL CARD
        // ======================================

        else {

            game.currentTurn =
                "computer";

            game.lastAction =
                "You played a card.";
        }


        // ======================================
        // UNO PENALTY
        // ======================================

        if (
            hadTwoCards &&
            game.playerHand.length === 1
        ) {

            if (!calledUno) {

                const added =
                    drawCards(
                        game,
                        game.playerHand,
                        2
                    );


                game.lastAction +=
                    ` UNO not called! You received ${added} penalty cards.`;
            }

            else {

                game.lastAction +=
                    " UNO!";
            }
        }


        // Reset after second-last card
        game.unoCalled = false;


        // ======================================
        // WINNER
        // ======================================

        const winner =
            checkWinner(game);


        if (winner) {

            game.winner =
                winner;

            game.gameStatus =
                "finished";

            game.lastAction =
                "You won the game!";
        }


        await game.save();


        res.status(200).json(game);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Unable to play card",
        });
    }
};


// ==========================================
// PLAYER DRAW
// ==========================================

export const drawCard = async (
    req,
    res
) => {

    try {

        const { gameId } =
            req.body;


        const game =
            await Game.findById(
                gameId
            );


        if (!game) {

            return res
                .status(404)
                .json({
                    message:
                        "Game not found",
                });
        }


        if (
            game.currentTurn !==
            "player"
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "It is not your turn",
                });
        }


        // ======================================
        // PENDING +2 / +4
        // ======================================

        if (
            game.pendingDraw > 0
        ) {

            const amount =
                game.pendingDraw;


            const cardsDrawn =
                drawCards(
                    game,
                    game.playerHand,
                    amount
                );


            game.pendingDraw = 0;

            game.pendingDrawType = "";

            game.unoCalled = false;


            // Player receives penalty and
            // loses the turn.
            game.currentTurn =
                "computer";


            game.lastAction =
                `You drew ${cardsDrawn} penalty cards and lost your turn.`;


            await game.save();


            return res
                .status(200)
                .json(game);
        }


        // ======================================
        // NORMAL DRAW
        // ======================================

        if (
            game.drawPile.length === 0
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "Draw pile is empty",
                });
        }


        const card =
            game.drawPile.pop();


        game.playerHand.push(
            card
        );


        game.unoCalled = false;

        game.currentTurn =
            "computer";

        game.lastAction =
            "You drew one card. Computer's turn.";


        await game.save();


        res.status(200).json(game);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Unable to draw card",
        });
    }
};


// ==========================================
// COMPUTER TURN
// ==========================================

export const computerTurn = async (
    req,
    res
) => {

    try {

        const { gameId } =
            req.body;


        const game =
            await Game.findById(
                gameId
            );


        if (!game) {

            return res
                .status(404)
                .json({
                    message:
                        "Game not found",
                });
        }


        if (
            game.gameStatus !==
            "playing"
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "Game has finished",
                });
        }


        if (
            game.currentTurn !==
            "computer"
        ) {

            return res
                .status(400)
                .json({
                    message:
                        "It is not computer's turn",
                });
        }


        const topCard =
            game.discardPile[
                game.discardPile.length - 1
            ];


        // ======================================
        // PENDING DRAW STACK
        // ======================================

        if (
            game.pendingDraw > 0
        ) {

            let stackIndex = -1;


            // +2 can stack +2
            if (
                game.pendingDrawType ===
                "draw2"
            ) {

                stackIndex =
                    game.computerHand
                        .findIndex(
                            (card) =>
                                card.value ===
                                "draw2"
                        );
            }


            // +4 can stack +4
            else if (
                game.pendingDrawType ===
                "wildDraw4"
            ) {

                stackIndex =
                    game.computerHand
                        .findIndex(
                            (card) =>
                                card.value ===
                                "wildDraw4"
                        );
            }


            // ==================================
            // COMPUTER STACKS
            // ==================================

            if (
                stackIndex !== -1
            ) {

                const stackCard =
                    game.computerHand[
                        stackIndex
                    ];


                game.computerHand.splice(
                    stackIndex,
                    1
                );


                game.discardPile.push(
                    stackCard
                );


                if (
                    stackCard.value ===
                    "draw2"
                ) {

                    game.pendingDraw += 2;

                    game.currentColor =
                        stackCard.color;


                    game.lastAction =
                        `Computer stacked +2. You must stack +2 or draw ${game.pendingDraw} cards.`;
                }


                else {

                    game.pendingDraw += 4;


                    game.currentColor =
                        getBestComputerColor(
                            game.computerHand
                        );


                    game.lastAction =
                        `Computer stacked +4. You must stack +4 or draw ${game.pendingDraw} cards.`;
                }


                game.currentTurn =
                    "player";


                const winner =
                    checkWinner(game);


                if (winner) {

                    game.winner =
                        winner;

                    game.gameStatus =
                        "finished";

                    game.lastAction =
                        "Computer won the game!";
                }


                await game.save();


                return res
                    .status(200)
                    .json(game);
            }


            // ==================================
            // COMPUTER CANNOT STACK
            // COMPUTER DRAWS PENALTY
            // ==================================

            const amount =
                game.pendingDraw;


            const cardsDrawn =
                drawCards(
                    game,
                    game.computerHand,
                    amount
                );


            game.pendingDraw = 0;

            game.pendingDrawType = "";


            // Computer loses turn.
            game.currentTurn =
                "player";


            game.lastAction =
                `Computer could not stack and drew ${cardsDrawn} penalty cards. Your turn.`;


            await game.save();


            return res
                .status(200)
                .json(game);
        }


        // ======================================
        // NORMAL COMPUTER MOVE
        // ======================================

        const playableIndex =
            game.computerHand
                .findIndex(
                    (card) =>
                        canPlayCard(
                            card,
                            topCard,
                            game.currentColor
                        )
                );


        // ======================================
        // NO PLAYABLE CARD
        // ======================================

        if (
            playableIndex === -1
        ) {

            if (
                game.drawPile.length > 0
            ) {

                const card =
                    game.drawPile.pop();


                game.computerHand.push(
                    card
                );


                game.lastAction =
                    "Computer drew a card. Your turn.";

            } else {

                game.lastAction =
                    "Computer could not play. Your turn.";
            }


            game.currentTurn =
                "player";


            await game.save();


            return res
                .status(200)
                .json(game);
        }


        // ======================================
        // COMPUTER PLAYS
        // ======================================

        const card =
            game.computerHand[
                playableIndex
            ];


        game.computerHand.splice(
            playableIndex,
            1
        );


        game.discardPile.push(
            card
        );


        // ======================================
        // COLOR
        // ======================================

        if (
            card.color === "wild"
        ) {

            game.currentColor =
                getBestComputerColor(
                    game.computerHand
                );

        } else {

            game.currentColor =
                card.color;
        }


        // ======================================
        // COMPUTER +2
        // ======================================

        if (
            card.value === "draw2"
        ) {

            game.pendingDraw = 2;

            game.pendingDrawType =
                "draw2";


            game.currentTurn =
                "player";


            game.lastAction =
                "Computer played Draw Two. Stack +2 or draw 2 cards.";
        }


        // ======================================
        // COMPUTER +4
        // ======================================

        else if (
            card.value ===
            "wildDraw4"
        ) {

            game.pendingDraw = 4;

            game.pendingDrawType =
                "wildDraw4";


            game.currentTurn =
                "player";


            game.lastAction =
                "Computer played Wild Draw Four. Stack +4 or draw 4 cards.";
        }


        // ======================================
        // COMPUTER SKIP
        //
        // Player is skipped.
        // Computer plays again.
        // ======================================

        else if (
            card.value === "skip"
        ) {

            game.currentTurn =
                "computer";


            game.lastAction =
                "Computer played Skip. Your turn was skipped.";
        }


        // ======================================
        // COMPUTER REVERSE
        //
        // Two players = Skip
        // ======================================

        else if (
            card.value === "reverse"
        ) {

            game.currentTurn =
                "computer";


            game.lastAction =
                "Computer played Reverse. Your turn was skipped.";
        }


        // ======================================
        // NORMAL CARD
        // ======================================

        else {

            game.currentTurn =
                "player";


            game.lastAction =
                "Computer played a card.";
        }


        // ======================================
        // WINNER
        // ======================================

        const winner =
            checkWinner(game);


        if (winner) {

            game.winner =
                winner;

            game.gameStatus =
                "finished";

            game.lastAction =
                "Computer won the game!";
        }


        await game.save();


        res.status(200).json(game);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Computer move failed",
        });
    }
};