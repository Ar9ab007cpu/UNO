import Card from "./Card";

const PlayerHand = ({
    cards = [],
    onPlayCard,
    disabled = false,
    canPlayCard = null,
    name = "You",
    avatar = "",
}) => {
    return (
        <section className="player-area">

            <div className="player-info">

                {avatar && (
                    <img
                        className="player-avatar"
                        src={avatar}
                        alt=""
                    />
                )}

                <h2>
                    {name}
                </h2>

                <span className="card-count">
                    {cards.length} cards
                </span>

            </div>

            <div
                className={
                    `player-hand ${
                        cards.length > 10
                            ? "many-cards"
                            : ""
                    } ${
                        cards.length > 14
                            ? "packed-cards"
                            : ""
                    }`
                }
            >

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
