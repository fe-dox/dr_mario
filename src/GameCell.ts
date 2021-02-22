import {Colour} from './Colour.js';

export default class GameCell {
    public readonly colour: Colour;
    private _isGoingToBeDeleted: boolean = false;

    constructor(colour: Colour) {
        this.colour = colour;
    }

    public static readonly Empty = new GameCell(Colour.Empty);

    public isEmpty() {
        return this.colour === Colour.Empty;
    }


    get isGoingToBeDeleted(): boolean {
        return this._isGoingToBeDeleted;
    }

    set isGoingToBeDeleted(value: boolean) {
        this._isGoingToBeDeleted = value;
    }
}
