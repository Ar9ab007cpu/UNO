import Card from "./Card";

const Deck = ({
    topCard,
    drawCount,
    currentColor,
    onDraw,
    disabled,
}) => {
    return (
        <section className="table-center">

            <div className="pile">
                <span className="pile-label">
                    Draw Pile
                </span>

                <button
                    className="draw-pile"
                    onClick={onDraw}
                    disabled={disabled}
                    type="button"
                >
                    <div className="draw-pile-inner">
                        UNO
                    </div>
                </button>

                <span className="pile-count">
                    {drawCount} cards
                </span>
            </div>

            <div className="direction">
                →
            </div>

            <div className="pile">
                <span className="pile-label">
                    Discard Pile
                </span>

                <Card
                    card={topCard}
                    disabled
                />

                <span className="pile-count">
                    Current: {currentColor}
                </span>
            </div>

        </section>
    );
};

export default Deck;