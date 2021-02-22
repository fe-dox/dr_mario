import GameCell from "./GameCell.js";
import {Colour} from './Colour.js';
import Utils from './Utils.js';
import GameElement from './GameElement.js';
import {PillAnimationEngine} from './PillAnimationEngine.js';

export const GAME_WIDTH = 8;
export const GAME_HEIGHT = 16;
const NUMBER_OF_VIRUSES = 4;

export type PillsMap = { [pillId: number]: Coordinate[] };

export type GameTable = GameCell[][];

export class Game {

    private _virusesLeft: number = NUMBER_OF_VIRUSES;
    private _currentScore: number = 0;
    private _gameState: GameState = GameState.NotReady;
    private _nextId: number = 0;
    private _pillAnimationEngine: PillAnimationEngine;
    private nextPillColours: Colour[] = [];
    private onVictory: Function;
    private renderFunction: Function;
    private onGameOver: Function;
    private scoresRenderer: Function;

    private _currentPillPositionX: number;
    private _currentPillPositionY: number;
    private _currentPillDirectionIsRight: boolean;

    private gameTable: GameTable = [];

    constructor(mountPoint: HTMLElement) {
        for (let i = 0; i < GAME_HEIGHT; i++) {
            let tmpArr = [];
            for (let j = 0; j < GAME_WIDTH; j++) {
                tmpArr.push(new GameCell(Colour.Empty));
            }
            this.gameTable.push(tmpArr);
        }
        this.GenerateViruses(NUMBER_OF_VIRUSES);
        let generator = new RandomGenerator(Colour.Blue, Colour.Brown, Colour.Yellow);
        this.nextPillColours = [generator.Get(), generator.Get()];
        this._pillAnimationEngine = new PillAnimationEngine(mountPoint);
        this._pillAnimationEngine.NewPill(this.nextPillColours[0], this.nextPillColours[1]);
    }

    private GenerateViruses(numberOfViruses: number) {
        let generator = new PerpetualRandomGenerator(Colour.Blue, Colour.Brown, Colour.Yellow);
        for (let i = 0; i < numberOfViruses; i++) {
            let y;
            let x;
            do {
                y = Utils.GetRandomNumber(0, 10) + 6;
                x = Utils.GetRandomNumber(0, GAME_WIDTH);
            } while (!this.gameTable[y][x].isEmpty());
            this.gameTable[y][x] = new GameElement(this.nextId, generator.Get(), true);
        }
    }

    public GetPillsMap(showViruses: boolean = false): PillsMap {
        let map: PillsMap = {};
        for (let i = 0; i < GAME_HEIGHT; i++) {
            for (let j = 0; j < GAME_WIDTH; j++) {
                if (!this.gameTable[i][j].isEmpty()) {
                    let value = this.gameTable[i][j] as GameElement;
                    if (!value.isVirus || showViruses) {
                        if (map[value.id] === undefined)
                            map[value.id] = [new Coordinate(j, i)];
                        else
                            map[value.id].push(new Coordinate(j, i));
                    }
                }
            }
        }
        for (const key in map) {
            if (!map.hasOwnProperty(key)) continue;
            map[key].sort((a, b) => {
                if (a.Y < b.Y) {
                    return -1;
                } else if (a.Y === b.Y) {
                    if (a.X < b.X) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else if (a.Y > b.Y) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
        return map;
    }


    public async NextPill() {
        if (this.gameState == GameState.Finished) return;
        await this._pillAnimationEngine.RenderAllFrames();
        if (!this.gameTable[0][3].isEmpty() || !this.gameTable[0][4].isEmpty()) {
            this.gameState = GameState.Finished;
            this.onGameOver?.();
            return;
        }

        let id = this.nextId;
        this.gameTable[0][3] = new GameElement(id, this.nextPillColours[0], false);
        this.gameTable[0][4] = new GameElement(id, this.nextPillColours[1], false);
        this._currentPillPositionX = 3;
        this._currentPillPositionY = 0;
        this._currentPillDirectionIsRight = true;
        this._gameState = GameState.Moving;
        let generator = new RandomGenerator(Colour.Blue, Colour.Brown, Colour.Yellow);
        this.nextPillColours = [generator.Get(), generator.Get()];
        this._pillAnimationEngine.NewPill(this.nextPillColours[0], this.nextPillColours[1]);
        this.OnRender();
    }

    private GetPillCoordinates(pillID: number, map: PillsMap = this.GetPillsMap()) {
        let pillCoordinates = map[pillID];
        if (pillCoordinates.length === 0) return undefined;
        if (pillCoordinates.length === 1) return {
            topLeft: pillCoordinates[0],
            bottomLeft: pillCoordinates[0],
            topRight: pillCoordinates[0],
            bottomRight: pillCoordinates[0],
            pillDirectionIsRight: false,
        };
        if (pillCoordinates[0].Y < pillCoordinates[1].Y) {
            return {
                topLeft: pillCoordinates[0],
                bottomLeft: pillCoordinates[1],
                topRight: pillCoordinates[0],
                bottomRight: pillCoordinates[1],
                pillDirectionIsRight: false,
            };
        } else {
            return {
                topLeft: pillCoordinates[0],
                bottomLeft: pillCoordinates[0],
                topRight: pillCoordinates[1],
                bottomRight: pillCoordinates[1],
                pillDirectionIsRight: true,
            };
        }

    }

    private GetCurrentPillCoordinates() {
        return {
            topLeft: this.GetCurrentPillTopLeftCoordinate(),
            bottomLeft: this.GetCurrentPillBottomLeftCoordinate(),
            topRight: this.GetCurrentPillTopRightCoordinate(),
            bottomRight: this.GetCurrentPillBottomRightCoordinate(),
        };
    }

    private GetCurrentPillTopRightCoordinate() {
        return new Coordinate(this._currentPillDirectionIsRight ? this._currentPillPositionX + 1 : this._currentPillPositionX,
            this._currentPillDirectionIsRight ? this._currentPillPositionY : this._currentPillPositionY - 1);
    }

    private GetCurrentPillTopLeftCoordinate() {
        return new Coordinate(this._currentPillPositionX, this._currentPillDirectionIsRight ? this._currentPillPositionY : this._currentPillPositionY - 1);
    }

    private GetCurrentPillBottomRightCoordinate() {
        return new Coordinate(this._currentPillDirectionIsRight ? this._currentPillPositionX + 1 : this._currentPillPositionX, this._currentPillPositionY);
    }

    private GetCurrentPillBottomLeftCoordinate() {
        return new Coordinate(this._currentPillPositionX, this._currentPillPositionY);
    }

    private MoveRightCoordinate(coordinate: Coordinate) {
        let tmp = this.gameTable[coordinate.Y][coordinate.X + 1];
        this.gameTable[coordinate.Y][coordinate.X + 1] = this.gameTable[coordinate.Y][coordinate.X];
        this.gameTable[coordinate.Y][coordinate.X] = tmp;
    }

    private MoveLeftCoordinate(coordinate: Coordinate) {
        let tmp = this.gameTable[coordinate.Y][coordinate.X - 1];
        this.gameTable[coordinate.Y][coordinate.X - 1] = this.gameTable[coordinate.Y][coordinate.X];
        this.gameTable[coordinate.Y][coordinate.X] = tmp;
    }

    private MoveDownCoordinate(coordinate: Coordinate) {
        let tmp = this.gameTable[coordinate.Y + 1][coordinate.X];
        this.gameTable[coordinate.Y + 1][coordinate.X] = this.gameTable[coordinate.Y][coordinate.X];
        this.gameTable[coordinate.Y][coordinate.X] = tmp;
    }

    private SwapCoordinates(coordinate1: Coordinate, coordinate2: Coordinate) {
        let tmp = this.gameTable[coordinate2.Y][coordinate2.X];
        this.gameTable[coordinate2.Y][coordinate2.X] = this.gameTable[coordinate1.Y][coordinate1.X];
        this.gameTable[coordinate1.Y][coordinate1.X] = tmp;
    }

    public MoveRight(pillCoordinates: { bottomLeft: Coordinate; bottomRight: Coordinate; topLeft: Coordinate; topRight: Coordinate } = this.GetCurrentPillCoordinates()): boolean {
        let {bottomRight, topRight, topLeft, bottomLeft} = pillCoordinates;
        if (bottomRight.X + 1 < GAME_WIDTH && this.gameTable[bottomRight.Y][bottomRight.X + 1].isEmpty()
            && this.gameTable[topRight.Y][topRight.X + 1].isEmpty()) {
            this._currentPillPositionX += 1;
            if (this._currentPillDirectionIsRight) {
                this.MoveRightCoordinate(bottomRight);
            } else {
                this.MoveRightCoordinate(topLeft);
            }
            this.MoveRightCoordinate(bottomLeft);
            return true;
        }
        return false;
    }

    public MoveLeft(pillCoordinates: { bottomLeft: Coordinate; bottomRight: Coordinate; topLeft: Coordinate; topRight: Coordinate } = this.GetCurrentPillCoordinates()): boolean {
        let {bottomRight, topLeft, bottomLeft} = pillCoordinates;
        if (bottomLeft.X - 1 >= 0 && (this.gameTable[bottomLeft.Y][bottomLeft.X - 1].isEmpty()) && this.gameTable[topLeft.Y][topLeft.X - 1].isEmpty()) {
            this._currentPillPositionX -= 1;
            this.MoveLeftCoordinate(bottomLeft);
            if (this._currentPillDirectionIsRight) {
                this.MoveLeftCoordinate(bottomRight);
            } else {
                this.MoveLeftCoordinate(topLeft);
            }
            return true;
        }
        return false;
    }

    private MoveDown(pillCoordinates: { bottomLeft: Coordinate; bottomRight: Coordinate; topLeft: Coordinate; topRight: Coordinate } = this.GetCurrentPillCoordinates(), pillDirectionIsRight: boolean = this._currentPillDirectionIsRight, isSinglePill: boolean = false): boolean {
        let {bottomRight, topLeft, bottomLeft} = pillCoordinates;
        if (bottomLeft.Y + 1 < GAME_HEIGHT && (this.gameTable[bottomLeft.Y + 1][bottomLeft.X].isEmpty()) && this.gameTable[bottomRight.Y + 1][bottomRight.X].isEmpty()) {
            this._currentPillPositionY += 1;
            if (isSinglePill) {
                this.MoveDownCoordinate(bottomLeft);
            } else {
                this.MoveDownCoordinate(bottomLeft);
                if (pillDirectionIsRight) {
                    this.MoveDownCoordinate(bottomRight);
                } else {
                    this.MoveDownCoordinate(topLeft);
                }
            }
            return true;
        } else {
            return false;
        }
    }

    public RotateRight(): boolean {
        if (this._gameState === GameState.Analysing) return false;
        if (this._currentPillDirectionIsRight) {
            let {bottomRight, bottomLeft} = this.GetCurrentPillCoordinates();
            let newCoordinate = new Coordinate(bottomLeft.X, bottomLeft.Y - 1);
            if (!this.gameTable[newCoordinate.Y][newCoordinate.X].isEmpty()) return false;
            this.SwapCoordinates(bottomRight, bottomLeft);
            this.SwapCoordinates(bottomRight, newCoordinate);
            this._currentPillDirectionIsRight = false;
            return true;
        } else {
            let {topLeft, bottomLeft} = this.GetCurrentPillCoordinates();
            if (bottomLeft.X === GAME_WIDTH - 1) {
                let newCoordinate = new Coordinate(bottomLeft.X - 1, bottomLeft.Y);
                if (!this.gameTable[newCoordinate.Y][newCoordinate.X].isEmpty()) return false;
                this.SwapCoordinates(bottomLeft, newCoordinate);
                this.SwapCoordinates(topLeft, bottomLeft);
                this._currentPillPositionX = newCoordinate.X;
            } else {
                let newCoordinate = new Coordinate(bottomLeft.X + 1, bottomLeft.Y);
                if (!this.gameTable[newCoordinate.Y][newCoordinate.X].isEmpty()) return false;
                this.SwapCoordinates(topLeft, newCoordinate);
            }
            this._currentPillDirectionIsRight = true;
            return true;
        }
    }

    public RotateLeft(): boolean {
        if (this._gameState === GameState.Analysing) return false;
        if (this._currentPillDirectionIsRight) {
            let {bottomLeft, bottomRight} = this.GetCurrentPillCoordinates();
            let newCoordinate = new Coordinate(bottomLeft.X, bottomLeft.Y - 1);
            if (!this.gameTable[newCoordinate.Y][newCoordinate.X].isEmpty()) return false;
            this.SwapCoordinates(bottomRight, newCoordinate);
            this._currentPillDirectionIsRight = false;
            return true;
        } else {
            let {topLeft, bottomLeft} = this.GetCurrentPillCoordinates();
            if (bottomLeft.X === GAME_WIDTH - 1) {
                let newCoordinate = new Coordinate(bottomLeft.X - 1, bottomLeft.Y);
                if (!this.gameTable[newCoordinate.Y][newCoordinate.X].isEmpty()) return false;
                this.SwapCoordinates(topLeft, newCoordinate);
                this._currentPillPositionX = newCoordinate.X;
            } else {
                let newCoordinate = new Coordinate(bottomLeft.X + 1, bottomLeft.Y);
                if (!this.gameTable[newCoordinate.Y][newCoordinate.X].isEmpty()) return false;
                this.SwapCoordinates(topLeft, bottomLeft);
                this.SwapCoordinates(topLeft, newCoordinate);
            }
            this._currentPillDirectionIsRight = true;
            return true;
        }
    }

    private MarkGoingToBeDeletedCells(dimension1, dimension2): boolean {
        let deleted = 0;
        for (let i = 0; i < dimension1; i++) {
            let tmpArr = [GameCell.Empty];
            for (let j = 0; j < dimension2; j++) {
                if (this.gameTable[i][j].colour === tmpArr[tmpArr.length - 1].colour) {
                    tmpArr.push(this.gameTable[i][j]);
                } else {
                    if (tmpArr.length >= 4 && !tmpArr[tmpArr.length - 1].isEmpty()) {
                        for (const gameCell of tmpArr) {
                            gameCell.isGoingToBeDeleted = true;
                        }
                        deleted++;
                    }
                    tmpArr = [this.gameTable[i][j]];
                }
            }
            if (tmpArr.length >= 4 && !tmpArr[tmpArr.length - 1].isEmpty()) {
                for (const gameCell of tmpArr) {
                    gameCell.isGoingToBeDeleted = true;
                }
                deleted++;
            }
        }

        for (let j = 0; j < dimension2; j++) {
            let tmpArr = [GameCell.Empty];
            for (let i = 0; i < dimension1; i++) {
                if (this.gameTable[i][j].colour === tmpArr[tmpArr.length - 1].colour) {
                    tmpArr.push(this.gameTable[i][j]);
                } else {
                    if (tmpArr.length >= 4 && !tmpArr[tmpArr.length - 1].isEmpty()) {
                        for (const gameCell of tmpArr) {
                            gameCell.isGoingToBeDeleted = true;
                        }
                        deleted++;
                    }
                    tmpArr = [this.gameTable[i][j]];
                }
            }
            if (tmpArr.length >= 4 && !tmpArr[tmpArr.length - 1].isEmpty()) {
                for (const gameCell of tmpArr) {
                    gameCell.isGoingToBeDeleted = true;
                }
                deleted++;
            }
        }
        return deleted > 0;
    }

    private DeleteMarkedCells() {
        let renderScores = 0;
        for (let i = 0; i < GAME_HEIGHT; i++) {
            for (let j = 0; j < GAME_WIDTH; j++) {
                if (this.gameTable[i][j].isGoingToBeDeleted) {
                    let el = this.gameTable[i][j] as GameElement;
                    if (el.isVirus) {
                        this._virusesLeft -= 1;
                        this._currentScore += 100;
                        renderScores++;
                        if (this._virusesLeft < 1) {
                            this.onVictory?.();
                            this._gameState = GameState.Finished;
                            this.OnRenderResults();
                            return;
                        }
                    }
                    this.gameTable[i][j] = GameCell.Empty;
                }
            }
        }
        if (renderScores > 0) {
            this.OnRenderResults();
        }
    }

    public async Drop() {
        if (!this.MoveDown()) {
            this._gameState = GameState.Analysing;
            let z = 0;
            let deleted = false;
            do {
                deleted = false;
                //TODO: Render delete
                if (this.MarkGoingToBeDeletedCells(GAME_HEIGHT, GAME_WIDTH)) {
                    deleted = true;
                    this.OnRender();
                    await Utils.Delay(300);
                    this.DeleteMarkedCells();
                    this.OnRender();
                }
                let movedElements = 0;
                let analysedIds = [];
                do {
                    analysedIds = [];
                    movedElements = 0;
                    z++;
                    for (let i = GAME_HEIGHT - 1; i >= 0; i--) {
                        for (let j = 0; j < GAME_WIDTH; j++) {
                            if (!this.gameTable[i][j].isEmpty()) {
                                let element = this.gameTable[i][j] as GameElement;
                                if (!element.isVirus && analysedIds.indexOf(element.id) === -1) {
                                    analysedIds.push(element.id);
                                    let coords = this.GetPillCoordinates(element.id);
                                    if (this.MoveDown(coords, coords.pillDirectionIsRight,
                                        coords.bottomLeft.Equals(coords.topLeft)
                                        && coords.bottomLeft.Equals(coords.bottomRight))) movedElements++;
                                }
                            }
                        }
                    }
                    this.OnRender();
                    await Utils.Delay(100);
                } while (movedElements > 0);
            } while (deleted === true);
            this.NextPill();
            this.OnRender();
            return false;
        }
        return true;
    }

    get nextId() {
        return this._nextId++;
    }

    public SetRenderer(fn: Function) {
        this.renderFunction = fn;
    }

    public OnGameOver(fn: Function) {
        this.onGameOver = fn;
    }

    public OnVictory(fn: Function) {
        this.onVictory = fn;
    }

    public OnRender() {
        this.renderFunction?.(this.gameTable);
    }

    public SetScoresRenderer(fn: Function) {
        this.scoresRenderer = fn;
    }

    public OnRenderResults() {
        this.scoresRenderer?.(this._virusesLeft, this._currentScore);
    }

    get gameState(): GameState {
        return this._gameState;
    }

    set gameState(state: GameState) {
        this._gameState = state;
    }


}

class PerpetualRandomGenerator<T> {
    private readonly elementsArray: T[];
    private current: number = 0;

    constructor(...elements: T[]) {
        this.elementsArray = Utils.Shuffle(elements);
    }

    public Get(): T {
        return this.elementsArray[this.current++ % this.elementsArray.length];
    }
}

class RandomGenerator<T> {
    private readonly elementsArray: T[];

    constructor(...elements: T[]) {
        this.elementsArray = elements;
    }

    public Get(): T {
        return this.elementsArray[Math.floor(this.elementsArray.length * Math.random())];
    }
}

export enum GameState {
    NotReady,
    Prepared,
    Moving,
    Analysing,
    Finished
}

export class Coordinate {
    X: number;
    Y: number;

    constructor(X: number, Y: number) {
        this.X = X;
        this.Y = Y;
    }

    public Equals(coordinate: Coordinate) {
        return this.X === coordinate.X && this.Y === coordinate.Y;
    }
}
