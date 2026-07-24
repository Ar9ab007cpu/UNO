import Card from "./Card";

const PlayerHand = ({
    cards = [],
    onPlayCard,
    disabled = false,
    canPlayCard = null,
}) => {
    return (
        <section className="player-area">

            <div className="player-info">

                <h2>
                    You
                </h2>

                <span className="card-count">
                    {cards.length} cards
                </span>

            </div>

            <div className="player-hand">

                {cards.map(
                    (card, index) => {

                        const allowed =
                            canPlayCard
                                ? canPlayCard(
                                      card
                                  )
                                : true;

                        return (
                            <Card
                                key={`${card.color}-${card.value}-${index}`}

                                card={card}

                                onClick={() =>
                                    onPlayCard(
                                        index,
                                        card
                                    )
                                }

                                disabled={
                                    disabled ||
                                    !allowed
                                }
                            />
                        );
                    }
                )}

            </div>

        </section>
    );
};

export default PlayerHand;