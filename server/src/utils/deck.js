const colors = ["red", "yellow", "green", "blue"];

export const createDeck = () => {
    const deck = [];

    colors.forEach((color) => {
        // One zero card for each color
        deck.push({
            color,
            value: "0",
            type: "number"
        });

        // Two copies of numbers 1-9
        for (let number = 1; number <= 9; number++) {
            for (let copy = 0; copy < 2; copy++) {
                deck.push({
                    color,
                    value: String(number),
                    type: "number"
                });
            }
        }

        // Two Skip cards
        for (let i = 0; i < 2; i++) {
            deck.push({
                color,
                value: "skip",
                type: "action"
            });
        }

        // Two Reverse cards
        for (let i = 0; i < 2; i++) {
            deck.push({
                color,
                value: "reverse",
                type: "action"
            });
        }

        // Two Draw Two cards
        for (let i = 0; i < 2; i++) {
            deck.push({
                color,
                value: "draw2",
                type: "action"
            });
        }
    });

    // Four Wild cards
    for (let i = 0; i < 4; i++) {
        deck.push({
            color: "wild",
            value: "wild",
            type: "wild"
        });
    }

    // Four Wild Draw Four cards
    for (let i = 0; i < 4; i++) {
        deck.push({
            color: "wild",
            value: "wildDraw4",
            type: "wild"
        });
    }

    return deck;
};

export const shuffleDeck = (deck) => {
    const shuffledDeck = [...deck];

    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffledDeck[i], shuffledDeck[j]] = [
            shuffledDeck[j],
            shuffledDeck[i]
        ];
    }

    return shuffledDeck;
};