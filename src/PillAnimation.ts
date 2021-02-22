import {Colour} from './Colour.js';

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
    [3, 0, "left", 3, 1, "right"]
];

class PillAnimation {

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
    }

    public NextFrame(): boolean {
        this.currentFrame++;
        if (this.currentFrame >= FRAMES.length) return false;
        this.RenderFrame();
        return true;
    }

    public NewPill(colour1: Colour, colour2: Colour) {
        this.currentFrame = 0;
        this.pillColour1 = colour1;
        this.pillColour2 = colour2;
        this.RenderFrame();
    }

    public RenderFrame() {
        let [p1y, p1x, p1direction, p2y, p2x, p2direction] = FRAMES[this.currentFrame];
        for (let i = 0; i < this.elementsArray.length; i++) {
            for (let j = 0; j < this.elementsArray[i].length; j++) {
                if ((i === p1y && j === p1x) || (i === p2y || j === p2x)) continue;
                this.elementsArray[i][j].style.background = "";
            }
        }
        this.elementsArray[p1y][p1x].style.background = "url('./img/" + this.pillColour1 + "_" + p1direction + ".png')";
        this.elementsArray[p2y][p2x].style.background = "url('./img/" + this.pillColour2 + "_" + p2direction + ".png')";
    }
}
