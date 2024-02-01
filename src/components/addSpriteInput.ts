export class AddSpriteInput {
    private addButton: HTMLElement = document.querySelector(".add-button") as HTMLElement;
    private spriteCreatorContainer: HTMLElement = document.querySelector(".sprite-creators") as HTMLElement;
    private spriteQuantity: number = 0;

    constructor() {
        this.addButton.addEventListener("click", () => {
            this.addNewUploadContainer();
            this.spriteQuantity += 1;
        });
    }

    private addNewUploadContainer() {
        let imgUploader = this.createImgUploader();
        let propWidthInput = this.createInputWithLabel("width", "W :");
        let propHeightInput = this.createInputWithLabel("height", "H :");
        let propZindexInput = this.createInputWithLabel("zIndex", "Zindex :");
        let propOpacityInput = this.createInputWithLabel("opacity", "Alpha :");

        let propFlipXInput = this.createFlipInput("flipX", "FlipX :");
        let propFlipYInput = this.createFlipInput("flipY", "FlipY :");
        let deleteButton = this.createDeleteButton();

        let container = document.createElement("div");
        container.classList.add("sprite-creator");

        this.appendChildernToCreator(container, [deleteButton, imgUploader, propWidthInput, propHeightInput, propZindexInput, propOpacityInput, propFlipXInput, propFlipYInput]);
        this.spriteCreatorContainer.appendChild(container);
    }

    private appendChildernToCreator(parent: HTMLDivElement, children: HTMLDivElement[]) {
        children.forEach(child => {
            parent.appendChild(child);
        });
    }

    private createImgUploader(): HTMLDivElement {
        let div = document.createElement("div");
        div.innerHTML = `
            <label for="img-upload-${this.spriteQuantity}" class="img-selector">Select image:</label>
            <input type="file" id="img-upload-${this.spriteQuantity}" class="img-uploader property-image" accept="image/*"><br>
        `
        return div;
    }

    private createInputWithLabel(idName: string, text: string): HTMLDivElement {
        let div = document.createElement("div");
        div.innerHTML = `
            <label for="img-${idName}-${this.spriteQuantity}">${text}</label>
            <input type="number" id="img-${idName}-${this.spriteQuantity}" class="property-${idName}">
        `
        return div;
    }

    private createFlipInput(idName: string, text: string): HTMLDivElement {
        let div = document.createElement("div");
        div.innerHTML = `
            <label for="img-${idName}-${this.spriteQuantity}">${text}</label>
            <input type="number" id="img-${idName}-${this.spriteQuantity}" class="property-${idName}" min="-1" max="1">
        `
        return div;
    }

    private createDeleteButton(): HTMLDivElement {
        let div = document.createElement("div");
        div.classList.add("delete-sprite-button");
        div.innerHTML = `X`;

        div.addEventListener("click", () => {
            if (div.parentElement) {
                div.parentElement.remove();
            }
        });
        return div;
    }
}