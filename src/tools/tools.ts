import { PositionUpdater } from "../canvas/canvas";
import { UpdateSpriteLayout } from "../components/addSpriteInput";

export class Tools {
    private canvasWidthInput: HTMLInputElement = document.querySelector("#canvas-width") as HTMLInputElement;
    private canvasHeightInput: HTMLInputElement = document.querySelector("#canvas-height") as HTMLInputElement;
    private canvasColorInput: HTMLInputElement = document.querySelector("#canvas-color") as HTMLInputElement;
    private errorDialog: HTMLElement = document.querySelector(".error-popup") as HTMLElement;

    private allFilesAmount: number = 0;
    private currentLoadedFilesAmount: number = 0;
    private spriteLayouts: SpriteCreatorLayout[];
    private callBack: (info: Layout) => void;

    constructor() {
    }

    getInfo(callback: (info: Layout) => void, zeroSpriteCallback: (info: CanvasLayout) => void): void {
        this.callBack = callback;
        this.spriteLayouts = this.createSpriteLayouts();

        let sizes = this.getCanvasDimensions();
        if (sizes.width == 0 || sizes.height == 0) {
            this.setCanvasSizesOfWindow();
        }

        if (this.spriteLayouts.length == 0) {
            zeroSpriteCallback(sizes);
            return;
        }

        if (this.spriteLayouts.every(layout => layout.src)) {
            this.allFilesAmount = this.spriteLayouts.length;
            this.spriteLayouts.forEach(layout => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageDataUrl = e.target?.result;
                    layout.src = imageDataUrl;
                    this.checkAllLoad();
                }
                reader.readAsDataURL(layout.src as Blob);
            });
        } else {
            this.errorDialog.style.opacity = "1";
            this.errorDialog.style.zIndex = "2";
            setTimeout(() => {
                this.errorDialog.style.opacity = "0";
                this.errorDialog.style.zIndex = "0";
            }, 2000);
        }
    }

    setNewPositions(info: PositionUpdater) {
        (document.querySelector(`#img-posX-${info.id}`) as HTMLInputElement).value = info.posX.toString();
        (document.querySelector(`#img-posY-${info.id}`) as HTMLInputElement).value = info.posY.toString();
    }

    private createSpriteLayouts(): SpriteCreatorLayout[] {
        let spriteLayouts: SpriteCreatorLayout[] = [];
        let spriteCreators = document.querySelectorAll(".sprite-creator");

        spriteCreators.forEach(creator => {
            //let file = ((creator.querySelector(".property-image") as HTMLInputElement).files as FileList)[0];
            spriteLayouts.push({
                id: +creator.id,
                width: +(creator.querySelector(".property-width") as HTMLInputElement).value,
                height: +(creator.querySelector(".property-height") as HTMLInputElement).value,
                zindex: +(creator.querySelector(".property-zIndex") as HTMLInputElement).value,
                alpha: +(creator.querySelector(".property-opacity") as HTMLInputElement).value,
                flipX: (creator.querySelector(".property-flipX") as HTMLInputElement).checked,
                flipY: (creator.querySelector(".property-flipY") as HTMLInputElement).checked,
                src: ((creator.querySelector(".property-image") as HTMLInputElement).files as FileList)[0],
                posX: +(creator.querySelector(".property-posX") as HTMLInputElement).value,
                posY: +(creator.querySelector(".property-posY") as HTMLInputElement).value,
                anchorX: +(creator.querySelector(".property-anchorX") as HTMLInputElement).value,
                anchorY: +(creator.querySelector(".property-anchorY") as HTMLInputElement).value,
            })
        });
        return spriteLayouts;
    }

    private checkAllLoad() {
        this.currentLoadedFilesAmount += 1;
        if (this.currentLoadedFilesAmount == this.allFilesAmount) {
            this.currentLoadedFilesAmount = 0;
            this.callBack({
                canvas: this.getCanvasDimensions(),
                sprites: this.spriteLayouts
            });
        }
    }

    private getCanvasDimensions(): CanvasLayout {
        let canvas: CanvasLayout = {
            width: +this.canvasWidthInput.value,
            height: +this.canvasHeightInput.value,
            color: this.canvasColorInput.value
        }
        return canvas;
    }

    private setCanvasSizesOfWindow() {
        this.canvasWidthInput.value = `${document.querySelector('.canvas-container')?.clientWidth}`;
        this.canvasHeightInput.value = `${document.querySelector('.canvas-container')?.clientHeight}`;
    }
}

export type Layout = {
    canvas: CanvasLayout,
    sprites: SpriteCreatorLayout[],
}

export type CanvasLayout = {
    width: number,
    height: number,
    color: string,
}

export type SpriteCreatorLayout = UpdateSpriteLayout & {
    src: string | ArrayBuffer | null | undefined | File,
    flipX: boolean,
    flipY: boolean,
}