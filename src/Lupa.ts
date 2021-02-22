import {Colour} from './Colour.js';

export class Glass {
    private readonly viruses: Virus[] = [];
    private readonly mountPoints: HTMLElement[] = [];
    private virusAnimationTimer: number;
    private virusRotateTimer: number;
    private isGameOverModeEnabled: boolean;
    private currentRotationID: number = 0;

    private static locationsArray: { top: number, left: number }[][] = [
        [{top: 220, left: 85}, {top: 285, left: 50}, {top: 280, left: 135}],
        [{top: 255, left: 55}, {top: 320, left: 95}, {top: 245, left: 125}],
        [{top: 285, left: 50}, {top: 280, left: 135}, {top: 220, left: 85}],
        [{top: 320, left: 95}, {top: 245, left: 125}, {top: 265, left: 50}],
        [{top: 280, left: 135}, {top: 220, left: 85}, {top: 280, left: 50}],
        [{top: 245, left: 125}, {top: 265, left: 50}, {top: 320, left: 95}],
        // [{top: 220, left: 85}, {top: 280, left: 50}, {top: 280, left: 135}],
        // [{top: 265, left: 50}, {top: 320, left: 95}, {top: 245, left: 125}],
    ];

    constructor(mountPoint) {
        let colours = [Colour.Blue, Colour.Brown, Colour.Yellow];
        for (let i = 0; i < colours.length; i++) {
            const colour = colours[i];
            let element = document.createElement('div');
            element.classList.add("virus");
            element.style.top = Glass.locationsArray[this.currentRotationID][i].top + "px";
            element.style.left = Glass.locationsArray[this.currentRotationID][i].left + "px";
            this.viruses.push(new Virus(colour, element));
            this.mountPoints.push(element);
            mountPoint.appendChild(element);
        }
        let obj = this;
        this.virusRotateTimer = window.setInterval(() => obj.RotateViruses(), 3000);
        this.virusAnimationTimer = window.setInterval(() => obj.AnimateViruses(), 1000);

    }

    private RotateViruses() {
        if (this.isGameOverModeEnabled) return;
        if (this.currentRotationID === Glass.locationsArray.length - 1) {
            this.currentRotationID = 0;
        } else {
            this.currentRotationID++;
        }
        for (let i = 0; i < this.mountPoints.length; i++) {
            this.mountPoints[i].style.top = Glass.locationsArray[this.currentRotationID][i].top + "px";
            this.mountPoints[i].style.left = Glass.locationsArray[this.currentRotationID][i].left + "px";
        }
    }

    private AnimateViruses() {
        for (const virus of this.viruses) {
            virus.NextState();
        }
    }

    public EnableGameOverMode() {
        this.isGameOverModeEnabled = true;
        window.clearInterval(this.virusRotateTimer);
        for (const virus of this.viruses) {
            virus.EnableGameOverMode();
        }
    }


}

class Virus {

    private readonly url: string;
    private currentState: number = 2;
    private stateChangesDirectionIsUp: boolean = true;
    private readonly element: HTMLElement;
    private isGameOverModeActive: boolean;

    constructor(colour: Colour, element: HTMLElement) {
        this.url = "./img/lupa/" + colour;
        this.element = element;
        this.UpdateBackgroundUrl();
    }

    public NextState() {
        if (!this.isGameOverModeActive) {
            if (this.currentState === 3 || this.currentState === 1) {
                this.stateChangesDirectionIsUp = !this.stateChangesDirectionIsUp;
            }
            if (this.stateChangesDirectionIsUp)
                this.currentState++;
            else
                this.currentState--;
        } else {
            if (this.currentState <= 2) {
                this.currentState = 4;
            } else {
                this.currentState = 2;
            }
        }
        this.UpdateBackgroundUrl();
    }

    public EnableGameOverMode() {
        this.isGameOverModeActive = true;
        this.currentState = 2;
    }

    private UpdateBackgroundUrl() {
        this.SetBackgroundUrl(this.url + "/" + this.currentState + ".png");
    }

    private SetBackgroundUrl(value: string) {
        this.element.style.background = `url('${value}')`;
    }
}
