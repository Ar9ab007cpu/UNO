import {
    createContext,
    useContext,
    useState,
} from "react";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [game, setGame] = useState(null);

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");

    return (
        <GameContext.Provider
            value={{
                game,
                setGame,
                loading,
                setLoading,
                message,
                setMessage,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    return useContext(GameContext);
};