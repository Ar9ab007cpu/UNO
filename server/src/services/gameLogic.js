export const canPlayCard = (
    card,
    topCard,
    currentColor,
    pendingDraw = 0,
    pendingDrawType = ""
) => {
    if (!card || !topCard) {
        return false;
    }

    // =========================================
    // DRAW STACK ACTIVE
    // =========================================

    if (pendingDraw > 0) {

        // +2 can only be stacked with +2
        if (pendingDrawType === "draw2") {
            return card.value === "draw2";
        }

        // +4 can only be stacked with +4
        if (pendingDrawType === "wildDraw4") {
            return card.value === "wildDraw4";
        }

        return false;
    }

    // =========================================
    // NORMAL PLAY
    // =========================================

    if (card.color === "wild") {
        return true;
    }

    if (card.color === currentColor) {
        return true;
    }

    if (card.value === topCard.value) {
        return true;
    }

    return false;
};


export const checkWinner = (game) => {

    if (game.playerHand.length === 0) {
        return "player";
    }

    if (game.computerHand.length === 0) {
        return "computer";
    }

    return null;
};


export const getPlayableCards = (
    hand,
    topCard,
    currentColor,
    pendingDraw = 0,
    pendingDrawType = ""
) => {

    return hand.filter((card) =>
        canPlayCard(
            card,
            topCard,
            currentColor,
            pendingDraw,
            pendingDrawType
        )
    );
};