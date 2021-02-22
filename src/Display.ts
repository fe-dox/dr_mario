export class Display {
    private readonly displayWidth: number;
    private readonly segments: HTMLElement[] = [];

    constructor(displayWidth: number, mountPoint: HTMLElement) {
        this.displayWidth = displayWidth;
        let table = document.createElement('table');
        let tr = document.createElement('tr');
        for (let i = 0; i < displayWidth; i++) {
            let td = document.createElement('td');
            td.style.background = "url('./img/cyfry/0.png')";
            tr.appendChild(td);
            this.segments.push(td);
        }
        table.appendChild(tr);
        mountPoint.appendChild(table);
    }


    public SetValue(value: number) {
        let str = this.NormalizeTextToBeDisplayed(String(value));
        for (let i = 0; i < str.length; i++) {
            this.segments[i].style.background = `url('./img/cyfry/${str[i]}.png')`;
        }
    }


    private NormalizeTextToBeDisplayed(str: string): string {
        while (str.length < this.displayWidth) {
            str = "0" + str;
        }
        return str;
    }


}
