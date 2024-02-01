export class Dragbar {
    private dragbar: HTMLElement = document.querySelector(".dragbar") as HTMLElement;
    private toolsContainer: HTMLElement = document.querySelector(".tools-container") as HTMLElement;
    private canvasContainer: HTMLElement = document.querySelector(".canvas-container") as HTMLElement;
    private isDragging: boolean = false;
    private totalWidthPercentage: number = 98;
    private minWidthPercentage: number = 20;

    constructor() {
        this.addListener();
    }

    private addListener() {
        this.dragbar.addEventListener("mousedown", () => this.mouseDown());
        document.addEventListener("mousemove", (e) => { this.mouseMove(e) });
        document.addEventListener("mouseup", () => this.mouseUp());
    }

    private mouseDown() {
        this.isDragging = true;
    }

    private mouseMove(e: MouseEvent) {
        if (this.isDragging) {
            let documentWidth = document.body.clientWidth;
            let leftPorsion = Math.max(20, Math.min((this.totalWidthPercentage * e.clientX) / documentWidth, this.totalWidthPercentage - this.minWidthPercentage));
            let rightPorsion = this.totalWidthPercentage - leftPorsion;
            this.toolsContainer.style.width = leftPorsion + "%";
            this.canvasContainer.style.width = rightPorsion + "%";
        }
    }

    private mouseUp() {
        this.isDragging = false;
    }
}