import { useEffect, useRef, useState } from "react";

import ComputerHand from "../components/ComputerHand";
import PlayerHand from "../components/PlayerHand";
import Deck from "../components/Deck";

import { useGame } from "../context/GameContext";

import {
    startGame,
    playCard,
    drawCard,
    computerTurn,
    callUno,
} from "../services/api";


// ==========================================
// TIMER SETTINGS
// ==========================================

const TURN_TIME = 30;


const Game = () => {

    const {
        game,
        setGame,
        loading,
        setLoading,
        message,
        setMessage,
    } = useGame();


    // ==========================================
    // WILD COLOR MODAL
    // ==========================================

    const [showColorPicker, setShowColorPicker] =
        useState(false);

    const [pendingWildCard, setPendingWildCard] =
        useState(null);


    // ==========================================
    // PENALTY NOTIFICATION
    // ==========================================

    const [showPenalty, setShowPenalty] =
        useState(false);


    // ==========================================
    // TURN TIMER
    // ==========================================

    const [timeLeft, setTimeLeft] =
        useState(TURN_TIME);


    // Prevent timeout from running twice
    const timeoutRunning =
        useRef(false);


    // ==========================================
    // START NEW GAME
    // ==========================================

    const handleStartGame = async () => {

        try {

            setLoading(true);

            setMessage("");

            setShowColorPicker(false);

            setPendingWildCard(null);

            setShowPenalty(false);

            setTimeLeft(TURN_TIME);

            timeoutRunning.current = false;


            const data =
                await startGame();


            setGame(data);

            setTimeLeft(TURN_TIME);

            setMessage(
                data.lastAction ||
                "Game started! Your turn."
            );


        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Unable to start game."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // CALL UNO
    // ==========================================

    const handleCallUno = async () => {

        if (!game) return;


        if (
            game.currentTurn !== "player"
        ) {

            setMessage(
                "You can only call UNO on your turn."
            );

            return;
        }


        if (
            game.playerHand.length !== 2
        ) {

            setMessage(
                "UNO can only be called when you have 2 cards."
            );

            return;
        }


        try {

            setLoading(true);


            const data =
                await callUno(
                    game._id
                );


            setGame(data);


            setMessage(
                "UNO called! Play your second-last card."
            );


        } catch (error) {

            console.error(error);


            setMessage(
                error.response?.data?.message ||
                "Unable to call UNO."
            );


        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // SUBMIT PLAYER CARD
    // ==========================================

    const submitCard = async (
        cardIndex,
        chosenColor = null
    ) => {

        if (!game) return;


        try {

            setLoading(true);

            setMessage("");

            setShowPenalty(false);


            const data =
                await playCard(
                    game._id,
                    cardIndex,
                    chosenColor
                );


            setGame(data);

            setTimeLeft(TURN_TIME);

            timeoutRunning.current = false;


            // ==================================
            // PLAYER WON
            // ==================================

            if (
                data.gameStatus ===
                    "finished" &&
                data.winner ===
                    "player"
            ) {

                setMessage(
                    "You won the game! 🎉"
                );

                return;
            }


            // ==================================
            // UNO PENALTY
            // ==================================

            if (
                data.lastAction
                    ?.toLowerCase()
                    .includes(
                        "uno not called"
                    )
            ) {

                setShowPenalty(true);

                setMessage(
                    data.lastAction
                );


                setTimeout(() => {

                    setShowPenalty(false);

                }, 3000);


                return;
            }


            // ==================================
            // NORMAL MESSAGE
            // ==================================

            setMessage(
                data.lastAction ||
                "Card played."
            );


        } catch (error) {

            console.error(error);


            setMessage(
                error.response?.data?.message ||
                "You cannot play this card."
            );


        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // PLAYER SELECTS CARD
    // ==========================================

    const handlePlayCard = async (
        cardIndex,
        card
    ) => {

        if (!game) return;


        if (
            game.currentTurn !== "player"
        ) {

            setMessage(
                "Please wait for the computer."
            );

            return;
        }


        // ======================================
        // PENDING +2 / +4
        // ======================================

        if (
            game.pendingDraw > 0
        ) {

            const requiredValue =
                game.pendingDrawType ===
                "draw2"
                    ? "draw2"
                    : "wildDraw4";


            if (
                card.value !==
                requiredValue
            ) {

                setMessage(
                    `You must stack ${
                        requiredValue === "draw2"
                            ? "+2"
                            : "+4"
                    } or draw ${game.pendingDraw} cards.`
                );

                return;
            }
        }


        // ======================================
        // WILD / WILD +4
        // ======================================

        if (
            card.color === "wild"
        ) {

            setPendingWildCard({
                cardIndex,
                card,
            });


            setShowColorPicker(true);


            return;
        }


        await submitCard(
            cardIndex
        );
    };


    // ==========================================
    // WILD COLOR SELECT
    // ==========================================

    const handleColorSelect =
        async (color) => {

            if (
                !pendingWildCard
            ) {
                return;
            }


            const { cardIndex } =
                pendingWildCard;


            setShowColorPicker(false);

            setPendingWildCard(null);


            await submitCard(
                cardIndex,
                color
            );
        };


    // ==========================================
    // CLOSE WILD MODAL
    // ==========================================

    const closeColorPicker = () => {

        if (loading) return;


        setShowColorPicker(false);

        setPendingWildCard(null);
    };


    // ==========================================
    // DRAW CARD
    // ==========================================

    const handleDrawCard = async () => {

        if (!game) return;


        if (
            game.currentTurn !== "player"
        ) {

            setMessage(
                "Please wait for the computer."
            );

            return;
        }


        try {

            setLoading(true);

            setMessage("");


            const pendingAmount =
                game.pendingDraw || 0;


            const data =
                await drawCard(
                    game._id
                );


            setGame(data);

            setTimeLeft(TURN_TIME);

            timeoutRunning.current = false;


            if (
                pendingAmount > 0
            ) {

                setMessage(
                    `You accepted the penalty and drew ${pendingAmount} cards.`
                );

            } else {

                setMessage(
                    data.lastAction ||
                    "You drew a card."
                );
            }


        } catch (error) {

            console.error(error);


            setMessage(
                error.response?.data?.message ||
                "Unable to draw card."
            );


        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // RESET TIMER WHEN TURN CHANGES
    // ==========================================

    useEffect(() => {

        if (!game) {
            return;
        }


        setTimeLeft(TURN_TIME);

        timeoutRunning.current =
            false;


    }, [
        game?.currentTurn,
        game?._id,
    ]);


    // ==========================================
    // 30 SECOND PLAYER TIMER
    // ==========================================

    useEffect(() => {

        if (
            !game ||
            game.gameStatus ===
                "finished" ||
            game.currentTurn !==
                "player"
        ) {

            return;
        }


        // Pause while Wild modal is open
        if (showColorPicker) {
            return;
        }


        // Pause during API request
        if (loading) {
            return;
        }


        const timer =
            setInterval(() => {

                setTimeLeft(
                    (previousTime) => {

                        if (
                            previousTime <= 1
                        ) {

                            clearInterval(
                                timer
                            );

                            return 0;
                        }


                        return (
                            previousTime - 1
                        );
                    }
                );

            }, 1000);


        return () => {

            clearInterval(timer);
        };


    }, [
        game?.currentTurn,
        game?.gameStatus,
        game?._id,
        showColorPicker,
        loading,
    ]);


    // ==========================================
    // PLAYER TIMEOUT
    // ==========================================

    useEffect(() => {

        if (
            !game ||
            timeLeft !== 0 ||
            game.currentTurn !==
                "player" ||
            game.gameStatus ===
                "finished" ||
            loading ||
            timeoutRunning.current
        ) {

            return;
        }


        const handleTimeout =
            async () => {

                timeoutRunning.current =
                    true;


                try {

                    setLoading(true);


                    const pendingAmount =
                        game.pendingDraw || 0;


                    if (
                        pendingAmount > 0
                    ) {

                        setMessage(
                            `Time expired! You must draw ${pendingAmount} penalty cards.`
                        );

                    } else {

                        setMessage(
                            "Time expired! Drawing one card automatically."
                        );
                    }


                    const data =
                        await drawCard(
                            game._id
                        );


                    setGame(data);

                    setTimeLeft(
                        TURN_TIME
                    );


                    if (
                        pendingAmount > 0
                    ) {

                        setMessage(
                            `Time expired. You drew ${pendingAmount} penalty cards.`
                        );

                    } else {

                        setMessage(
                            "Time expired. One card was drawn automatically."
                        );
                    }


                } catch (error) {

                    console.error(
                        error
                    );


                    setMessage(
                        error.response
                            ?.data
                            ?.message ||
                        "Unable to process timeout."
                    );


                    setTimeLeft(
                        TURN_TIME
                    );


                } finally {

                    setLoading(false);

                    timeoutRunning.current =
                        false;
                }
            };


        handleTimeout();


    }, [
        timeLeft,
        game?.currentTurn,
        game?.gameStatus,
        game?._id,
        game?.pendingDraw,
        loading,
    ]);


    // ==========================================
    // COMPUTER TURN
    // ==========================================

    useEffect(() => {

        if (
            !game ||
            game.currentTurn !==
                "computer" ||
            game.gameStatus ===
                "finished"
        ) {

            return;
        }


        const timer =
            setTimeout(
                async () => {

                    try {

                        setLoading(true);


                        setMessage(
                            "Computer is thinking..."
                        );


                        const data =
                            await computerTurn(
                                game._id
                            );


                        setGame(data);

                        setTimeLeft(
                            TURN_TIME
                        );


                        if (
                            data.gameStatus ===
                                "finished" &&
                            data.winner ===
                                "computer"
                        ) {

                            setMessage(
                                "Computer won the game!"
                            );

                        } else {

                            setMessage(
                                data.lastAction ||
                                (
                                    data.currentTurn ===
                                    "player"
                                        ? "Your turn."
                                        : "Computer plays again."
                                )
                            );
                        }


                    } catch (error) {

                        console.error(
                            error
                        );


                        setMessage(
                            error.response
                                ?.data
                                ?.message ||
                            "Computer move failed."
                        );


                    } finally {

                        setLoading(false);
                    }

                },
                1000
            );


        return () => {

            clearTimeout(timer);
        };


    }, [
        game?.currentTurn,
        game?._id,
        game?.gameStatus,
        game?.updatedAt,
    ]);


    // ==========================================
    // START SCREEN
    // ==========================================

    if (!game) {

        return (

            <main className="start-screen">

                <div className="start-content">

                    <div className="uno-logo">
                        UNO
                    </div>


                    <h1>
                        UNO
                    </h1>


                    <p>
                        Player vs Computer
                    </p>


                    <button
                        className="primary-button"
                        onClick={
                            handleStartGame
                        }
                        disabled={loading}
                        type="button"
                    >

                        {loading
                            ? "Starting..."
                            : "Start New Game"}

                    </button>


                    {message && (

                        <p className="message">
                            {message}
                        </p>

                    )}

                </div>

            </main>
        );
    }


    // ==========================================
    // TOP CARD
    // ==========================================

    const topCard =
        game.discardPile[
            game.discardPile.length - 1
        ];


    // ==========================================
    // UNO BUTTON ENABLED?
    // ==========================================

    const canCallUno =
        game.playerHand.length === 2 &&
        game.currentTurn === "player" &&
        game.gameStatus === "playing" &&
        !game.unoCalled;


    // ==========================================
    // DRAW BUTTON TEXT / PENALTY
    // ==========================================

    const pendingDrawAmount =
        game.pendingDraw || 0;


    // ==========================================
    // GAME
    // ==========================================

    return (

        <main className="game-page">


            {/* =================================
                WILD COLOR MODAL
            ================================= */}

            {showColorPicker && (

                <div
                    className="modal-overlay"

                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeColorPicker();
                        }
                    }}
                >

                    <div
                        className="color-modal"

                        role="dialog"

                        aria-modal="true"

                        aria-labelledby="color-modal-title"
                    >

                        <button
                            className="modal-close"

                            onClick={
                                closeColorPicker
                            }

                            disabled={loading}

                            type="button"

                            aria-label="Close"
                        >
                            ×
                        </button>


                        <div className="modal-icon">
                            W
                        </div>


                        <h2 id="color-modal-title">
                            Choose a Color
                        </h2>


                        <p>
                            Select the color you
                            want to continue
                            playing with.
                        </p>


                        <div className="color-options">


                            <button
                                className="color-option red-option"

                                onClick={() =>
                                    handleColorSelect(
                                        "red"
                                    )
                                }

                                disabled={loading}

                                type="button"
                            >

                                <span className="color-circle">
                                    R
                                </span>

                                <strong>
                                    Red
                                </strong>

                            </button>


                            <button
                                className="color-option yellow-option"

                                onClick={() =>
                                    handleColorSelect(
                                        "yellow"
                                    )
                                }

                                disabled={loading}

                                type="button"
                            >

                                <span className="color-circle">
                                    Y
                                </span>

                                <strong>
                                    Yellow
                                </strong>

                            </button>


                            <button
                                className="color-option green-option"

                                onClick={() =>
                                    handleColorSelect(
                                        "green"
                                    )
                                }

                                disabled={loading}

                                type="button"
                            >

                                <span className="color-circle">
                                    G
                                </span>

                                <strong>
                                    Green
                                </strong>

                            </button>


                            <button
                                className="color-option blue-option"

                                onClick={() =>
                                    handleColorSelect(
                                        "blue"
                                    )
                                }

                                disabled={loading}

                                type="button"
                            >

                                <span className="color-circle">
                                    B
                                </span>

                                <strong>
                                    Blue
                                </strong>

                            </button>

                        </div>


                        <button
                            className="modal-cancel"

                            onClick={
                                closeColorPicker
                            }

                            disabled={loading}

                            type="button"
                        >
                            Cancel
                        </button>

                    </div>

                </div>
            )}


            {/* =================================
                UNO PENALTY
            ================================= */}

            {showPenalty && (

                <div className="penalty-notification">

                    <div className="penalty-icon">
                        +2
                    </div>


                    <div>

                        <strong>
                            UNO Penalty!
                        </strong>

                        <span>
                            You forgot to call UNO.
                            Two cards were added to
                            your hand.
                        </span>

                    </div>

                </div>
            )}


            {/* =================================
                HEADER
            ================================= */}

            <header className="game-header">


                <div className="header-logo">
                    UNO
                </div>


                <div className="game-status">


                    <span>
                        Turn
                    </span>


                    <strong>

                        {game.currentTurn ===
                        "player"
                            ? "Your Turn"
                            : "Computer"}

                    </strong>


                    {/* =========================
                        TIMER
                    ========================= */}

                    <div
                        className={
                            `turn-timer ${
                                timeLeft <= 10 &&
                                game.currentTurn ===
                                    "player"
                                    ? "timer-warning"
                                    : ""
                            }`
                        }
                    >

                        <span className="timer-icon">
                            ⏱
                        </span>


                        <span className="timer-number">

                            {game.currentTurn ===
                            "player"
                                ? timeLeft
                                : "--"}

                        </span>


                        <small>
                            sec
                        </small>

                    </div>

                </div>


                <button
                    className="new-game-button"

                    onClick={
                        handleStartGame
                    }

                    disabled={loading}

                    type="button"
                >
                    New Game
                </button>

            </header>


            {/* =================================
                MESSAGE
            ================================= */}

            {message && (

                <div
                    className="message-bar"
                    aria-live="polite"
                >
                    {message}
                </div>

            )}


            {/* =================================
                PENDING DRAW WARNING
            ================================= */}

            {pendingDrawAmount > 0 &&
                game.currentTurn ===
                    "player" && (

                <div className="message-bar">

                    ⚠️ Pending penalty:
                    {" "}
                    <strong>
                        +{pendingDrawAmount}
                    </strong>

                    {" — "}

                    Stack

                    {" "}

                    <strong>
                        {game.pendingDrawType ===
                        "draw2"
                            ? "+2"
                            : "+4"}
                    </strong>

                    {" "}

                    or click the draw pile.

                </div>
            )}


            {/* =================================
                WINNER
            ================================= */}

            {game.gameStatus ===
                "finished" && (

                <div className="winner-banner">

                    <h2>

                        {game.winner ===
                        "player"
                            ? "🎉 You Won!"
                            : "🤖 Computer Won"}

                    </h2>


                    <button
                        onClick={
                            handleStartGame
                        }

                        className="primary-button"

                        type="button"
                    >
                        Play Again
                    </button>

                </div>
            )}


            {/* =================================
                GAME TABLE
            ================================= */}

            <div className="game-table">


                {/* COMPUTER */}

                <ComputerHand
                    cards={
                        game.computerHand
                    }
                />


                {/* DECK */}

                <Deck
                    topCard={
                        topCard
                    }

                    drawCount={
                        game.drawPile.length
                    }

                    currentColor={
                        game.currentColor
                    }

                    onDraw={
                        handleDrawCard
                    }

                    disabled={
                        loading ||
                        showColorPicker ||
                        game.currentTurn !==
                            "player" ||
                        game.gameStatus ===
                            "finished"
                    }
                />


                {/* =================================
                    UNO BUTTON
                ================================= */}

                <div className="uno-call-area">


                    <button
                        className={
                            `uno-call-button ${
                                canCallUno
                                    ? "uno-active"
                                    : "uno-disabled"
                            }`
                        }

                        onClick={
                            handleCallUno
                        }

                        disabled={
                            !canCallUno ||
                            loading ||
                            showColorPicker
                        }

                        type="button"
                    >

                        <span>
                            UNO!
                        </span>

                    </button>


                    {game.unoCalled ? (

                        <div className="uno-called-status">

                            <span className="uno-check">
                                ✓
                            </span>


                            <div>

                                <strong>
                                    UNO Called!
                                </strong>

                                <small>
                                    Play your
                                    second-last card.
                                </small>

                            </div>

                        </div>

                    ) : (

                        <p className="uno-warning">

                            {canCallUno
                                ? "UNO is ready! Call it before playing your second-last card."
                                : "UNO becomes active when you have 2 cards."}

                        </p>
                    )}

                </div>


                {/* PLAYER */}

                <PlayerHand
                    cards={
                        game.playerHand
                    }

                    onPlayCard={
                        handlePlayCard
                    }

                    disabled={
                        loading ||
                        showColorPicker ||
                        game.currentTurn !==
                            "player" ||
                        game.gameStatus ===
                            "finished"
                    }
                />

            </div>

        </main>
    );
};


export default Game;