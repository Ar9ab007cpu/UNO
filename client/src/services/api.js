import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

export const startGame =
    async (player = {}) => {
        const response =
            await API.post(
                "/game/start",
                player
            );

        return response.data;
    };


export const getGame =
    async (gameId) => {
        const response =
            await API.get(
                `/game/${gameId}`
            );

        return response.data;
    };


export const callUno =
    async (gameId) => {
        const response =
            await API.post(
                "/game/uno",
                {
                    gameId,
                }
            );

        return response.data;
    };


export const playCard =
    async (
        gameId,
        cardIndex,
        chosenColor = null
    ) => {
        const response =
            await API.post(
                "/game/play",
                {
                    gameId,
                    cardIndex,
                    chosenColor,
                }
            );

        return response.data;
    };


export const drawCard =
    async (gameId) => {
        const response =
            await API.post(
                "/game/draw",
                {
                    gameId,
                }
            );

        return response.data;
    };


export const computerTurn =
    async (gameId) => {
        const response =
            await API.post(
                "/game/computer",
                {
                    gameId,
                }
            );

        return response.data;
    };


export default API;
