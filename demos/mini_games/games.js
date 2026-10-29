"use strict";

(() => {
    const gameLabels = {
        merge: "Fusión de bolas",
        catch: "Laberinto circular",
        breaker: "Rompebloques",
        tetris: "Caída de bloques"
    };
    const gameButtons = [...document.querySelectorAll("[data-start-game]")];
    const player = document.getElementById("gamePlayer");
    const playerTitle = document.getElementById("playerTitle");
    const frame = document.getElementById("gameFrame");
    const status = document.getElementById("gameStatus");
    const restartButton = document.getElementById("restartGame");
    let activeGame = "";

    if (!gameButtons.length || !player || !playerTitle || !frame || !status || !restartButton) return;

    function gameUrl(game) {
        const url = new URL("../animated_backgrounds/index.html", window.location.href);
        url.searchParams.set("game", game);
        return url.href;
    }

    function launchGame(game, scroll = true) {
        if (!Object.prototype.hasOwnProperty.call(gameLabels, game)) return;
        activeGame = game;
        gameButtons.forEach((button) => {
            const isActive = button.dataset.startGame === game;
            button.setAttribute("aria-pressed", String(isActive));
        });

        player.hidden = false;
        playerTitle.textContent = gameLabels[game];
        frame.title = `${gameLabels[game]} — Arkas Arcade`;
        frame.dataset.game = game;
        frame.src = gameUrl(game);
        status.textContent = `Partida abierta: ${gameLabels[game]}.`;

        if (scroll) {
            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            player.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        }
    }

    gameButtons.forEach((button) => {
        button.addEventListener("click", () => launchGame(button.dataset.startGame));
    });

    restartButton.addEventListener("click", () => {
        if (!activeGame) return;
        frame.src = gameUrl(activeGame);
        status.textContent = `Partida reiniciada: ${gameLabels[activeGame]}.`;
    });

    const requestedGame = new URLSearchParams(window.location.search).get("game");
    if (requestedGame && Object.prototype.hasOwnProperty.call(gameLabels, requestedGame)) {
        launchGame(requestedGame, false);
    }
})();
