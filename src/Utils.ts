export default class Utils {
    public static GetRandomNumber(a: number, b: number) {
        return Math.floor(Math.random() * b + a);
    }

    public static Shuffle(array: any[]): any[] {
        let counter = array.length;

        while (counter > 0) {
            let index = Math.floor(Math.random() * counter);

            counter--;

            let temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }

    public static Delay(time: number) {
        return new Promise((resolve) => {
            window.setTimeout(() => {
                resolve(true);
            }, time);
        });
    }
}
