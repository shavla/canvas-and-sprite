export class Tools {
    private canvasWidthInput: HTMLInputElement = document.querySelector("#canvas-width") as HTMLInputElement;
    private canvasHeightInput: HTMLInputElement = document.querySelector("#canvas-height") as HTMLInputElement;
    private canvasColorInput: HTMLInputElement = document.querySelector("#canvas-color") as HTMLInputElement;
    private errorDialog: HTMLElement = document.querySelector(".error-dialog") as HTMLElement;

    private allFilesAmount: number = 0;
    private currentLoadedFilesAmount: number = 0;
    private spriteLayouts: SpriteCreatorLayout[];
    private callBack: (info: Layout) => void;

    constructor() {
    }

    getInfo(callback: (info: Layout) => void): void {
        this.callBack = callback;
        this.spriteLayouts = this.createSpriteLayouts();

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
            setTimeout(() => {
                this.errorDialog.style.opacity = "0";
            }, 2000);
        }
    }

    private createSpriteLayouts(): SpriteCreatorLayout[] {
        let spriteLayouts: SpriteCreatorLayout[] = [];
        let spriteCreators = document.querySelectorAll(".sprite-creator");

        spriteCreators.forEach(creator => {
            //let file = ((creator.querySelector(".property-image") as HTMLInputElement).files as FileList)[0];
            spriteLayouts.push({
                width: +(creator.querySelector(".property-width") as HTMLInputElement).value,
                height: +(creator.querySelector(".property-height") as HTMLInputElement).value,
                zindex: +(creator.querySelector(".property-zIndex") as HTMLInputElement).value,
                alpha: +(creator.querySelector(".property-opacity") as HTMLInputElement).value,
                flipX: +(creator.querySelector(".property-flipX") as HTMLInputElement).value,
                flipY: +(creator.querySelector(".property-flipY") as HTMLInputElement).value,
                src: ((creator.querySelector(".property-image") as HTMLInputElement).files as FileList)[0],
            })
        });
        return spriteLayouts;
    }

    private checkAllLoad() {
        this.currentLoadedFilesAmount += 1;
        if (this.currentLoadedFilesAmount == this.allFilesAmount) {
            this.currentLoadedFilesAmount = 0;
            this.callBack({
                canvas: {
                    width: +this.canvasWidthInput.value,
                    height: +this.canvasHeightInput.value,
                    color: this.canvasColorInput.value
                },
                sprites: this.spriteLayouts
            });
        }
    }
}

export type Layout = {
    canvas: CanvasLayout,
    sprites: SpriteCreatorLayout[]
}

export type CanvasLayout = {
    width: number,
    height: number,
    color: string
}

export type SpriteCreatorLayout = {
    width: number,
    height: number,
    src: string | ArrayBuffer | null | undefined | File,
    zindex: number,
    alpha: number,
    flipX: number,
    flipY: number
}