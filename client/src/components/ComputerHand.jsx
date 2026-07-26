import Card from "./Card";

const ComputerHand = ({
    cards = [],
    name = "Nattu Kaka",
    avatar = "/avatars/nattu-kaka.svg",
}) => {
    return (
        <section className="computer-area">
            <div className="player-info">
                {avatar && (
                    <img
                        className="player-avatar"
                        src={avatar}
                        alt=""
                    />
                )}

                <h2>{name}</h2>

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
