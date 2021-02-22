import GameCell from './GameCell.js';
import {Colour} from './Colour.js';

export default class GameElement extends GameCell {
    private readonly _id: number;
    private readonly _isVirus: boolean;
    private _isSingle: boolean;

    constructor(id: number, colour: Colour, isVirus: boolean) {
        super(colour);
        this._id = id;
        this._isSingle = isVirus;
        this._isVirus = isVirus;
    }

    get id(): number {
        return this._id;
    }

    get isVirus(): boolean {
        return this._isVirus;
    }
}
