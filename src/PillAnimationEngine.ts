import {Colour} from './Colour.js';
import Utils from './Utils.js';

const WIDTH = 12;
const HEIGHT = 8;
const FRAMES = [
    [3, 10, "left", 3, 11, "right"],
    [3, 10, "down", 2, 10, "up"],
    [2, 10, "right", 2, 9, "left"],
    [1, 9, "up", 2, 9, "down"],
    [1, 8, "left", 1, 9, "right"],
    [1, 8, "down", 0, 8, "up"],
    [1, 8, "right", 1, 7, "left"],
    [0, 7, "up", 1, 7, "down"],
    [1, 6, "left", 1, 7, "right"],
    [1, 6, "down", 0, 6, "up"],
    [1, 6, "right", 1, 5, "left"],
    [0, 5, "up", 1, 5, "down"],
    [1, 4, "left", 1, 5, "right"],
    [1, 4, "down", 0, 4, "up"],
    [1, 4, "right", 1, 3, "left"],
    [0, 3, "up", 1, 3, "down"],
    [1, 2, "left", 1, 3, "right"],
    [1, 2, "down", 0, 2, "up"],
    [2, 2, "right", 2, 1, "left"],
    [1, 1, "up", 2, 1, "down"],
    [2, 0, "left", 2, 1, "right"],
    [3, 0, "left", 3, 1, "right"],
    [4, 0, "left", 4, 1, "right"],
    [5, 0, "left", 5, 1, "right"]
];

const DR_FRAMES = [
    [[6, 11, "down_1"], [7, 11, "down_2"]],
    [[5, 10, "middle11"], [5, 11, "middle12"], [6, 10, "middle21"], [6, 11, "middle22"]],
    [[4, 11, "up_1"], [5, 11, "up_2"], [6, 11, "up_3"]]
];

export class PillAnimationEngine {

    private readonly elementsArray: HTMLElement[][] = [];
    private currentFrame: number = 0;
    private pillColour1: Colour;
    private pillColour2: Colour;


    constructor(mountPoint: HTMLElement) {
        let table = document.createElement('table');
        for (let i = 0; i < HEIGHT; i++) {
            let tmpArr = [];
            let tr = document.createElement('tr');
            for (let j = 0; j < WIDTH; j++) {
                let td = document.createElement('td');
                tmpArr.push(td);
                tr.appendChild(td);
            }
            table.appendChild(tr);
            this.elementsArray.push(tmpArr);
        }
        mountPoint.appendChild(table);
    }


    public async RenderAllFrames(): Promise<boolean> {
        while (this.NextFrame()) await Utils.Delay(50);
        return true;
    }

    private NextFrame(): boolean {
        this.currentFrame++;
        if (this.currentFrame >= FRAMES.length) return false;
        this.RenderFrame();
        return true;
    }

    public async NewPill(colour1: Colour, colour2: Colour) {
        this.ClearAll();
        this.currentFrame = 0;
        this.pillColour1 = colour1;
        this.pillColour2 = colour2;
        for (let i = 0; i < DR_FRAMES.length; i++) {
            this.ClearAll();
            this.RenderDrFrame(i);
            await Utils.Delay(200);
        }
        this.RenderFrame();
    }

    private RenderDrFrame(frameId: number) {
        for (const frameElement of DR_FRAMES[frameId]) {
            this.elementsArray[frameElement[0]][frameElement[1]].style.background = "url('./img/hands/" + frameElement[2] + ".png')";
        }
    }

    private ClearAll() {
        for (let i = 0; i < this.elementsArray.length; i++) {
            for (let j = 0; j < this.elementsArray[i].length; j++) {
                this.elementsArray[i][j].style.background = "";
            }
        }
    }

    private RenderFrame() {
        let [p1y, p1x, p1direction, p2y, p2x, p2direction] = FRAMES[this.currentFrame];
        this.ClearAll();
        this.elementsArray[p1y][p1x].style.background = "url('./img/" + this.pillColour1 + "_" + p1direction + ".png')";
        this.elementsArray[p2y][p2x].style.background = "url('./img/" + this.pillColour2 + "_" + p2direction + ".png')";
        if (this.currentFrame < 5) {
            this.RenderDrFrame(2);
        } else if (this.currentFrame < 10) {
            this.RenderDrFrame(1);
        } else {
            this.RenderDrFrame(0);
        }
    }
}
