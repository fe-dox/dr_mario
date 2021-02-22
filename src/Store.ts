const HIGH_SCORE_HANDLE = "currentHighScore";

export class Store {

    public static GetHighScore(): number {
        return Number(window.localStorage.getItem(HIGH_SCORE_HANDLE));
    }

    public static SetHighScore(highScore: number) {
        window.localStorage.setItem(HIGH_SCORE_HANDLE, highScore.toString());
    }
}
