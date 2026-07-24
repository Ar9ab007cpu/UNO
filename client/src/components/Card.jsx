const Card = ({
    card,
    onClick,
    hidden = false,
    disabled = false,
}) => {
    if (hidden) {
        return (
            <div className="uno-card card-back">
                <div className="back-logo">
                    UNO
                </div>
            </div>
        );
    }

    if (!card) {
        return null;
    }

    const getDisplayValue = () => {
        switch (card.value) {
            case "skip":
                return "⊘";

            case "reverse":
                return "↻";

            case "draw2":
                return "+2";

            case "wild":
                return "W";

            case "wildDraw4":
                return "+4";

            default:
                return card.value;
        }
    };

    const cardClass =
        card.color === "wild"
            ? "wild-card"
            : card.color;

    return (
        <button
            className={`uno-card ${cardClass}`}
            onClick={onClick}
            disabled={disabled}
            type="button"
        >
            <span className="card-corner top-left">
                {getDisplayValue()}
            </span>

            <div className="card-center">
                {getDisplayValue()}
            </div>

            <span className="card-corner bottom-right">
                {getDisplayValue()}
            </span>
        </button>
    );
};

export default Card;