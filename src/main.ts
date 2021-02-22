import {Coordinate, Game, GAME_HEIGHT, GAME_WIDTH, GameState, GameTable} from './Game.js';
import GameElement from './GameElement.js';
import {Colour} from './Colour.js';
import Utils from './Utils.js';
import {Glass} from './Lupa.js';
import {Display} from './Display.js';
import {Store} from './Store.js';


function createGame() {
    document.getElementById("gameOverDoctor").style.background = "";
    let pillAnimationDiv = document.getElementById("pillAnimation");
    pillAnimationDiv.innerHTML = "";
    let game = new Game(pillAnimationDiv);
    let gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '';
    let gameAreaArray = prepareGameAreaArray(GAME_HEIGHT, GAME_WIDTH, gameArea);
    let glassMountPoint = document.getElementById('glass');
    glassMountPoint.innerHTML = '';
    let glass = new Glass(glassMountPoint);
    let endMessage = document.getElementById('endMessage');
    endMessage.innerHTML = '';
    let currentScoreDiv = document.getElementById('currentScore');
    let highScoreDiv = document.getElementById('highScore');
    let numberOfVirusesDiv = document.getElementById('numberOfViruses');
    currentScoreDiv.innerHTML = '';
    highScoreDiv.innerHTML = '';
    numberOfVirusesDiv.innerHTML = '';
    let highScoreDisplay = new Display(7, highScoreDiv);
    let currentScoreDisplay = new Display(7, currentScoreDiv);
    let numberOfVirusesDisplay = new Display(2, numberOfVirusesDiv);
    highScoreDisplay.SetValue(Store.GetHighScore());
    game.NextPill();
    game.SetRenderer(render);
    game.OnGameOver(gameOver);
    game.OnVictory(victory);
    game.SetScoresRenderer(renderScores);
    game.OnRender();

    let interval = window.setInterval(async () => {
        if (game.gameState !== GameState.Moving) return;
        await game.Drop();
        game.OnRender();
    }, 1000);

    document.addEventListener('keydown', async ev => {
        if (game.gameState !== GameState.Moving) return;
        switch (ev.key) {
            case "ArrowLeft":
            case "a":
                if (game.MoveLeft()) {
                    game.OnRender();
                }
                break;
            case "ArrowRight":
            case "d":
                if (game.MoveRight()) {
                    game.OnRender();
                }
                break;
            case "ArrowDown":
            case "s":
                game.gameState = GameState.Analysing;
                while (await game.Drop()) {
                    game.OnRender();
                    await Utils.Delay(100);
                }
                break;
            case "ArrowUp":
            case "e":
            case "w":
                if (game.RotateLeft()) {
                    game.OnRender();
                }
                break;
            case "Shift":
            case "q":
                if (game.RotateRight()) {
                    game.OnRender();
                }
                break;
            default:
                break;
        }
    });

    function render(gameTable: GameTable) {
        for (let i = 0; i < gameTable.length; i++) {
            for (let j = 0; j < gameTable[i].length; j++) {
                let element = gameTable[i][j];
                let gameHtmlElement = gameAreaArray[i][j];
                if (element.isEmpty()) {
                    gameHtmlElement.style.background = "";
                }
            }
        }
        let pillsMap = game.GetPillsMap(true);
        for (let pillId in pillsMap) {
            if (!pillsMap.hasOwnProperty(pillId)) continue;
            let coordinates = pillsMap[pillId] as Coordinate[];
            if (coordinates.length === 1) {
                let element = gameTable[coordinates[0].Y][coordinates[0].X] as GameElement;
                let htmlElement = gameAreaArray[coordinates[0].Y][coordinates[0].X];
                if (element.isVirus) {
                    if (element.isGoingToBeDeleted) {
                        switch (element.colour) {
                            case Colour.Blue:
                                htmlElement.style.background = "url('./img/bl_x.png')";
                                break;
                            case Colour.Brown:
                                htmlElement.style.background = "url('./img/br_x.png')";
                                break;
                            case Colour.Yellow:
                                htmlElement.style.background = "url('./img/yl_x.png')";
                                break;
                            case Colour.Empty:
                                htmlElement.style.background = "";
                                break;
                        }
                    } else {
                        switch (element.colour) {
                            case Colour.Blue:
                                htmlElement.style.background = "url('./img/covid_blue.png')";
                                break;
                            case Colour.Brown:
                                htmlElement.style.background = "url('./img/covid_brown.png')";
                                break;
                            case Colour.Yellow:
                                htmlElement.style.background = "url('./img/covid_yellow.png')";
                                break;
                            case Colour.Empty:
                                htmlElement.style.background = "";
                                break;
                        }
                    }
                } else {
                    if (element.isGoingToBeDeleted) {
                        switch (element.colour) {
                            case Colour.Blue:
                                htmlElement.style.background = "url('./img/bl_o.png')";
                                break;
                            case Colour.Brown:
                                htmlElement.style.background = "url('./img/br_o.png')";
                                break;
                            case Colour.Yellow:
                                htmlElement.style.background = "url('./img/yl_o.png')";
                                break;
                            case Colour.Empty:
                                htmlElement.style.background = "";
                                break;
                        }
                    } else {
                        switch (element.colour) {
                            case Colour.Blue:
                                htmlElement.style.background = "url('./img/bl_dot.png')";
                                break;
                            case Colour.Brown:
                                htmlElement.style.background = "url('./img/br_dot.png')";
                                break;
                            case Colour.Yellow:
                                htmlElement.style.background = "url('./img/yl_dot.png')";
                                break;
                            case Colour.Empty:
                                htmlElement.style.background = "";
                                break;
                        }
                    }
                }
            } else {
                let coordinate1 = coordinates[0];
                let coordinate2 = coordinates[1];
                let pill1Direction = "";
                let pill2Direction = "";
                if (coordinate1.Y == coordinate2.Y) {
                    pill1Direction = "left";
                    pill2Direction = "right";
                } else {
                    pill1Direction = "up";
                    pill2Direction = "down";
                }
                gameAreaArray[coordinate1.Y][coordinate1.X].style.background = `url('./img/${gameTable[coordinate1.Y][coordinate1.X].colour}_` +
                    `${gameTable[coordinate1.Y][coordinate1.X].isGoingToBeDeleted ? "o" : pill1Direction}.png')`;
                gameAreaArray[coordinate2.Y][coordinate2.X].style.background = `url('./img/${gameTable[coordinate2.Y][coordinate2.X].colour}_` +
                    `${gameTable[coordinate2.Y][coordinate2.X].isGoingToBeDeleted ? "o" : pill2Direction}.png')`;
            }
        }
    }

    function prepareGameAreaArray(height: number, width: number, mountPoint: HTMLElement): HTMLElement[][] {
        let arr = [];
        for (let i = 0; i < height; i++) {
            let tmpArr = [];
            let tmpTr = document.createElement('tr');
            for (let j = 0; j < width; j++) {
                let element = document.createElement("td");
                tmpArr.push(element);
                tmpTr.appendChild(element);
            }
            arr.push(tmpArr);
            mountPoint.appendChild(tmpTr);
        }
        return arr;
    }

    async function gameOver() {
        endMessage.innerHTML = '<img src="./img/go.png" alt="game over">';
        document.getElementById("gameOverDoctor").style.background = "url('./img/go_dr.png')";
        game.OnRender();
        glass.EnableGameOverMode();
        await Utils.Delay(7000);
        createGame();
    }

    async function victory() {
        endMessage.innerHTML = '<img src="./img/sc.png" alt="victory">';
        game.OnRender();
        game.OnRender();
        await Utils.Delay(7000);
        createGame();
    }

    function renderScores(numberOfViruses, currentScore) {
        if (currentScore > Store.GetHighScore()) {
            Store.SetHighScore(currentScore);
            highScoreDisplay.SetValue(currentScore);
        }
        currentScoreDisplay.SetValue(currentScore);
        numberOfVirusesDisplay.SetValue(numberOfViruses);
    }
}

(function () {
    createGame();
})();


