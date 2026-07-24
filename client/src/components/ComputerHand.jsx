import Card from "./Card";

const ComputerHand = ({ cards = [] }) => {
    return (
        <section className="computer-area">
            <div className="player-info">
                <h2>Computer</h2>

                <span className="card-count">
                    {cards.length} cards
                </span>
            </div>

            <div className="computer-hand">
                {cards.map((card, index) => (
                    <Card
                        key={index}
                        card={card}
                        hidden
                    />
                ))}
            </div>
        </section>
    );
};

export default ComputerHand;