'use strict';

(function () {

    const TicTacToe = {
        state: {
            turnsCount: 0,
            playersInfo: {
                player_1: { name: 'Player 1', symbol: 'cross' },
                player_2: { name: 'Player 2', symbol: 'circle' },
            },
            currentPlayer: 'player_1',
            currentGameBoard: Array(3).fill(null).map(() => Array(3).fill(undefined)),
        },

        constants: {
            svgs: {
                cross: `<svg width="90" height="90" viewBox="0 0 25 25" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"> <title>cross</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-469.000000, -1041.000000)" fill="currentColor"> <path d="M487.148,1053.48 L492.813,1047.82 C494.376,1046.26 494.376,1043.72 492.813,1042.16 C491.248,1040.59 488.712,1040.59 487.148,1042.16 L481.484,1047.82 L475.82,1042.16 C474.257,1040.59 471.721,1040.59 470.156,1042.16 C468.593,1043.72 468.593,1046.26 470.156,1047.82 L475.82,1053.48 L470.156,1059.15 C468.593,1060.71 468.593,1063.25 470.156,1064.81 C471.721,1066.38 474.257,1066.38 475.82,1064.81 L481.484,1059.15 L487.148,1064.81 C488.712,1066.38 491.248,1066.38 492.813,1064.81 C494.376,1063.25 494.376,1060.71 492.813,1059.15 L487.148,1053.48" id="cross" sketch:type="MSShapeGroup"> </path> </g> </g> </svg>`,
                circle: `<svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" /> </svg>`,
            },
            winning_combinations: [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ],
        },

        selectors: {
            playerInfo: '.main-player__info',
            playerForm: '.main-player__selection',
            gameboard: '.main-gameboard',
            turns: '.main-game__turns .turns',
            currentTurnInfo: '.current-turn__info',
            boardWrapper: ".main-gameboard__wrapper",
            rows: '.row',
            blocks: '.column',
            winnerDialog: ".winner-dialog",
            winnerText: '.winner-text',
            resetBtn: '.reset-game',
        },

        init() {
            this.cacheDOM();
            this.bindEvents();
        },

        cacheDOM() {
            const { selectors } = this;
            this.dom = {
                playerInfo: document.querySelector(selectors.playerInfo),
                form: document.querySelector(selectors.playerForm),
                mainGameBoard: document.querySelector(selectors.gameboard),
                turns: document.querySelector(selectors.turns),
                currentTurnInfo: document.querySelector(selectors.currentTurnInfo),
                boardWrapper: document.querySelector(selectors.boardWrapper),
                winnerDialog: document.querySelector(selectors.winnerDialog),
                winnerText: document.querySelector(selectors.winnerText),
                resetBtn: document.querySelector(selectors.resetBtn),
            };
        },

        bindEvents() {
            this.dom.form.addEventListener('submit', this.handleFormSubmit.bind(this), true);
            this.dom.resetBtn.addEventListener('click', this.buildGame.bind(this), true);
        },

        buildGame() {
            this.resetGame();
            if (!this.dom.mainGameBoard) throw Error("The DOM must have an element with class 'main-gameboard'");
            this.dom.mainGameBoard.appendChild(this.createGameBoard());
            this.blocks = Array.from(document.querySelectorAll(this.selectors.blocks));
            this.blocks.forEach(block => block.addEventListener("click", this.handleClick.bind(this), true));
            this.updateCurrentTurnInfo();
            this.showGameElements();
        },

        createGameBoard() {
            const fragment = document.createDocumentFragment();
            this.state.currentGameBoard.forEach((row, rowIndex) => {
                const rowElement = document.createElement("DIV");
                rowElement.classList.add("row");
                rowElement.setAttribute("data-row", rowIndex);
                row.forEach((_, colIndex) => {
                    const colElement = document.createElement("DIV");
                    colElement.classList.add("column");
                    colElement.setAttribute("data-column", colIndex);
                    if (rowIndex === 2) colElement.classList.add("bb-0");
                    rowElement.appendChild(colElement);
                });
                fragment.appendChild(rowElement);
            });
            return fragment;
        },

        resetGame() {
            this.dom.mainGameBoard.classList.remove('disabled');
            this.blocks?.forEach(block => block.removeEventListener("click", this.handleClick.bind(this), true));
            this.dom.winnerDialog.close();
            this.dom.mainGameBoard.innerHTML = "";
            this.dom.turns.innerHTML = "";
            this.state.turnsCount = 0;
            this.state.currentGameBoard = Array(3).fill(null).map(() => Array(3).fill(undefined));
            this.state.currentPlayer = "player_1";
            this.resetDOMStyles();
            console.log(this.state);
        },

        resetDOMStyles() {
            this.dom.playerInfo.removeAttribute("style");
            this.dom.currentTurnInfo.style.display = "none";
            this.dom.boardWrapper.style.display = "none";
        },

        handleFormSubmit(event) {
            event.preventDefault();
            const formData = new FormData(this.dom.form);
            this.state.playersInfo = {
                player_1: { name: formData.get("player_1_name"), symbol: formData.get("player_1_symbol") },
                player_2: { name: formData.get("player_2_name"), symbol: formData.get("player_2_symbol") },
            };
            this.state.currentGameBoard = Array(3).fill(null).map(() => Array(3).fill(undefined));
            this.buildGame();
        },

        handleClick(event) {
            const target = event.currentTarget;
            const currentPlayerSymbol = this.state.playersInfo[this.state.currentPlayer].symbol;
            const { row, column } = this.getTargetCoordinates(target);
            if (!this.isPositionAvailable(row, column)) return;
            this.updateGameState(row, column, currentPlayerSymbol);
            this.renderMove(target, currentPlayerSymbol, row, column);
            this.checkGameState();
        },

        getTargetCoordinates(target) {
            const row = target.closest(this.selectors.rows).dataset.row;
            const column = target.dataset.column;
            return { row, column };
        },

        isPositionAvailable(row, column) {
            return this.state.currentGameBoard[row][column] === undefined;
        },

        updateGameState(row, column, symbol) {
            this.state.currentGameBoard[row][column] = symbol;
        },

        renderMove(target, symbol, row, column) {
            target.insertAdjacentHTML("beforeend", this.constants.svgs[symbol]);
            target.setAttribute('data-symbol', symbol);
            const listItem = document.createElement('li');
            listItem.innerText = `${this.state.playersInfo[this.state.currentPlayer].name} played at row ${row}, column ${column}`;
            this.dom.turns.appendChild(listItem);
        },

        checkGameState() {
            if (this.checkWinner()) {
                this.showWinner();
            } else if (this.checkDraw()) {
                this.showDraw();
            } else {
                this.handlePlayerChange();
            }
        },

        handlePlayerChange() {
            this.state.currentPlayer = this.state.currentPlayer === 'player_1' ? 'player_2' : 'player_1';
            this.updateCurrentTurnInfo();
        },

        updateCurrentTurnInfo() {
            const currentPlayerName = this.state.playersInfo[this.state.currentPlayer].name;
            this.dom.currentTurnInfo.innerText = `${currentPlayerName}'s turn!`;
        },

        checkDraw() {
            this.state.turnsCount += 1;
            if (this.state.turnsCount === 9) {
                const listItem = document.createElement('li');
                listItem.innerText = `It's a draw. Seems like both are PRO PLAYERS`;
                this.dom.turns.appendChild(listItem);
                this.showGameElements();
                return true;
            }
            return false;
        },

        checkWinner() {
            return this.constants.winning_combinations.some(combination => {
                const [a, b, c] = combination;
                const valueAtPosition1 = this.blocks[a].getAttribute("data-symbol");
                const valueAtPosition2 = this.blocks[b].getAttribute("data-symbol");
                const valueAtPosition3 = this.blocks[c].getAttribute("data-symbol");
                return valueAtPosition1 === valueAtPosition2 && valueAtPosition2 === valueAtPosition3 && valueAtPosition1 != null;
            });
        },

        showWinner() {
            this.dom.mainGameBoard.classList.add('disabled');
            this.dom.winnerText.innerHTML = `Congratulations ${this.state.playersInfo[this.state.currentPlayer].name} on winning!`
            this.dom.winnerDialog.showModal();
        },

        showDraw() {
            this.dom.playerInfo.removeAttribute("style");
        },

        showGameElements() {
            this.dom.playerInfo.style.display = 'none';
            this.dom.currentTurnInfo.removeAttribute("style");
            this.dom.boardWrapper.removeAttribute("style");
        },
    };

    TicTacToe.init();



    // const mainGameboard = document.querySelector('.main-gameboard');
    // const mainGameTurns = document.querySelector('.main-game__turns .turns');
    // const crossSvg = `<svg width="90" height="90" viewBox="0 0 25 25" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"> <title>cross</title> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-469.000000, -1041.000000)" fill="currentColor"> <path d="M487.148,1053.48 L492.813,1047.82 C494.376,1046.26 494.376,1043.72 492.813,1042.16 C491.248,1040.59 488.712,1040.59 487.148,1042.16 L481.484,1047.82 L475.82,1042.16 C474.257,1040.59 471.721,1040.59 470.156,1042.16 C468.593,1043.72 468.593,1046.26 470.156,1047.82 L475.82,1053.48 L470.156,1059.15 C468.593,1060.71 468.593,1063.25 470.156,1064.81 C471.721,1066.38 474.257,1066.38 475.82,1064.81 L481.484,1059.15 L487.148,1064.81 C488.712,1066.38 491.248,1066.38 492.813,1064.81 C494.376,1063.25 494.376,1060.71 492.813,1059.15 L487.148,1053.48" id="cross" sketch:type="MSShapeGroup"> </path> </g> </g> </svg>`;
    // const zeroSvg = `<svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" /> </svg>`;
    // const INITIAL_GAMEBOARD_ARRAY = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];

    // function buildGamebard() {

    //     if (!mainGameboard) {
    //         throw Error("The DOM must have an element with class 'main-gameboard'")
    //     }

    //     const gameboardFragment = document.createDocumentFragment();
    //     for (let row = 0; row < INITIAL_GAMEBOARD_ARRAY.length; row++) {
    //         const rowElement = document.createElement("DIV");
    //         rowElement.classList.add("row");
    //         rowElement.setAttribute("data-row", row);
    //         for (let column = 0; column < INITIAL_GAMEBOARD_ARRAY[row].length; column++) {
    //             const columnElement = document.createElement("DIV");
    //             columnElement.classList.add("column");
    //             columnElement.setAttribute("data-column", column);
    //             rowElement.appendChild(columnElement);
    //             if (row === 2) {
    //                 columnElement.classList.add("bb-0");
    //             }
    //         }
    //         gameboardFragment.appendChild(rowElement);
    //     }
    //     mainGameboard.appendChild(gameboardFragment);
    // }

    // // buildGamebard();
    // let currentPlayer = 'X' || "O";
    // let turnsCount = 0;



    // const WINNING_GAMEBOARD_COMBINATIONS = [
    //     [0, 1, 2],
    //     [3, 4, 5],
    //     [6, 7, 8],

    //     [0, 3, 6],
    //     [1, 4, 7],
    //     [2, 5, 8],

    //     [0, 4, 8],
    //     [2, 4, 6]
    // ];

    // const currentGameBoard = [...INITIAL_GAMEBOARD_ARRAY];
    // const blocks = Array.from(document.querySelectorAll(".column"));

    // function checkIfWinner() {
    //     for (let winningCombinations of WINNING_GAMEBOARD_COMBINATIONS) {
    //         console.log(winningCombinations);
    //         const valueAtPosition1 = blocks[winningCombinations[0]].getAttribute("data-symbol");
    //         const valueAtPosition2 = blocks[winningCombinations[1]].getAttribute("data-symbol");
    //         const valueAtPosition3 = blocks[winningCombinations[2]].getAttribute("data-symbol");
    //         if (valueAtPosition1 === valueAtPosition2 && valueAtPosition2 === valueAtPosition3 && valueAtPosition1 != null) {
    //             console.log(valueAtPosition1 + " is Winner");
    //             mainGameboard.classList.add('disabled');
    //             break;
    //         }
    //     }
    // }

    // function checkIfDraw() {
    //     if (turnsCount === 9) {
    //         const listItem = document.createElement('li');
    //         listItem.innerText = `It's a draw. Seems like both are PRO PLAYERS`;
    //         mainGameTurns.appendChild(listItem);
    //     }
    // }

    // function changePlayer() {

    // }

    // function handleBlockClick(event) {
    //     const target = event.currentTarget;
    //     const targetRow = target.closest(".row").dataset.row;
    //     const targetColumn = target.dataset.column;
    //     const isCurrentPositionFullfilled = currentGameBoard[targetRow][targetColumn] === undefined;
    //     if (!isCurrentPositionFullfilled) {
    //         return;
    //     }
    //     turnsCount += 1;
    //     currentGameBoard[targetRow][targetColumn] = currentPlayer;
    //     target.insertAdjacentHTML("beforeend", currentPlayer === "X" ? crossSvg : zeroSvg);
    //     target.setAttribute('data-symbol', currentPlayer);
    //     currentPlayer = currentPlayer === "X" ? "O" : "X";
    //     const listItem = document.createElement('li');
    //     listItem.innerText = `${currentPlayer} played at row ${targetRow}, column ${targetColumn}`;
    //     mainGameTurns.appendChild(listItem);
    //     checkIfWinner();
    //     changePlayer();
    //     checkIfDraw();
    // }




    // if (blocks.length) {
    //     blocks.forEach((block) => block.addEventListener("click", handleBlockClick.bind(this), true));
    // }
})();