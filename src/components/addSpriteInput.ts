export class AddSpriteInput {
    private addButton: HTMLElement = document.querySelector(".add-button") as HTMLElement;
    private spriteCreatorContainer: HTMLElement = document.querySelector(".sprite-creators") as HTMLElement;
    private spriteQuantity: number = 0;

    constructor(private callback: (info: UpdateSpriteLayout) => void, private callbackForFlip: (info: FlipLayout) => void, private deleteSprite: (id: number) => void, private createCallback: () => void) {
        this.addButton.addEventListener("click", () => {
            this.addNewUploadContainer();
            this.spriteQuantity += 1;
        });
    }

    private addNewUploadContainer() {
        let imgUploader = this.createImgUploader();
        let propWidthInput = this.createInputWithLabel("width", "W :");
        let propHeightInput = this.createInputWithLabel("height", "H :");
        let propZindexInput = this.createInputWithLabel("zIndex", "Zindex :", 2);
        let propOpacityInput = this.createInputWithLabel("opacity", "Alpha :", 2);
        let positionXInput = this.createInputWithLabel("posX", "X :", 1);
        let positionYInput = this.createInputWithLabel("posY", "Y :", 1);
        let anchorXInput = this.createAnchorInputs("anchorX", "Anchor X :");
        let anchorYInput = this.createAnchorInputs("anchorY", "Anchor Y :");

        let propFlipInput = this.createFlipInputs();
        let deleteButton = this.createDeleteButton(this.spriteQuantity);

        let container = document.createElement("div");
        container.id = `${this.spriteQuantity}`;
        container.classList.add("sprite-creator");

        this.appendChildernToCreator(container, [deleteButton, imgUploader, propWidthInput, propHeightInput, positionXInput, positionYInput, anchorXInput, anchorYInput, propZindexInput, propOpacityInput, propFlipInput]);
        this.spriteCreatorContainer.appendChild(container);

        this.getAndSetImgDeminsionsToInputs(this.spriteQuantity);
        this.listenToInputs(this.spriteQuantity);
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

    private createInputWithLabel(idName: string, text: string, defaultValue?: number): HTMLDivElement {
        let div = document.createElement("div");
        div.innerHTML = `
            <label for="img-${idName}-${this.spriteQuantity}">${text}</label>
            <input type="number" id="img-${idName}-${this.spriteQuantity}" class="property-${idName}" ${defaultValue ? `value=${defaultValue - 1}` : ""}>`
        return div;
    }

    private createAnchorInputs(idName: string, text: string): HTMLDivElement {
        let div = document.createElement("div");
        div.innerHTML = `
        <label for="img-${idName}-${this.spriteQuantity}">${text}</label>
        <input type="number" id="img-${idName}-${this.spriteQuantity}" class="property-${idName}" min="0" max ="1" step="0.1" value="0">`
        return div;
    }

    private createFlipInputs(): HTMLDivElement {
        let div = document.createElement("div");
        div.innerHTML = `<fieldset>
        <legend>Flip:</legend>
        <div>
          <label for="flepX-${this.spriteQuantity}">X:</label>
          <input type="checkbox" id="flepX-${this.spriteQuantity}" class="property-flipX"/>
        </div>
        <div>
          <label for="flepY-${this.spriteQuantity}">Y:</label>
          <input type="checkbox" id="flepY-${this.spriteQuantity}" class="property-flipY"/>
        </div>
      </fieldset>`;
        return div;
    }

    private createDeleteButton(index: number): HTMLDivElement {
        let div = document.createElement("div");
        div.classList.add("delete-sprite-button");
        div.innerHTML = `X`;

        div.addEventListener("click", () => {
            if (div.parentElement) {
                div.parentElement.remove();
                this.deleteSprite(index);
            }
        });
        return div;
    }

    private getAndSetImgDeminsionsToInputs(index: number) {
        let input = document.querySelector(`#img-upload-${this.spriteQuantity}`) as HTMLInputElement;
        input?.addEventListener("change", () => {
            if ((input?.files as FileList).length > 0) {
                const img = document.createElement('img');

                const selectedImage = (input.files as FileList)[0];
                const objectURL = URL.createObjectURL(selectedImage);

                img.onload = () => {
                    (document.querySelector(`#img-width-${index}`) as HTMLInputElement).value = `${img.width}`;
                    (document.querySelector(`#img-height-${index}`) as HTMLInputElement).value = `${img.height}`;

                    this.createCallback();
                    URL.revokeObjectURL(objectURL);
                }
                img.src = objectURL;
            }
        });
    }

    private listenToInputs(index: number) {
        let widthInput = document.querySelector(`#img-width-${index}`) as HTMLInputElement;
        let heightInput = document.querySelector(`#img-height-${index}`) as HTMLInputElement;
        let zindexInput = document.querySelector(`#img-zIndex-${index}`) as HTMLInputElement;
        let alphaInput = document.querySelector(`#img-opacity-${index}`) as HTMLInputElement;
        let flipXInput = document.querySelector(`#flepX-${index}`) as HTMLInputElement;
        let flipYInput = document.querySelector(`#flepY-${index}`) as HTMLInputElement;
        let posXInput = document.querySelector(`#img-posX-${index}`) as HTMLInputElement;
        let posYInput = document.querySelector(`#img-posY-${index}`) as HTMLInputElement;
        let anchorXInput = document.querySelector(`#img-anchorX-${index}`) as HTMLInputElement;
        let anchorYInput = document.querySelector(`#img-anchorY-${index}`) as HTMLInputElement;

        [widthInput, heightInput, posXInput, posYInput, zindexInput, alphaInput, anchorXInput, anchorYInput].forEach(x => {
            x.addEventListener("input", () => {
                this.callback({
                    id: index,
                    width: +widthInput.value,
                    height: +heightInput.value,
                    zindex: +zindexInput.value,
                    alpha: +alphaInput.value,
                    posX: +posXInput.value,
                    posY: +posYInput.value,
                    anchorX: +anchorXInput.value,
                    anchorY: +anchorYInput.value
                });
            });
        });

        [flipXInput, flipYInput].forEach(x => {
            x.addEventListener("input", () => {
                this.callbackForFlip({
                    id: index,
                    flipX: flipXInput.checked,
                    flipY: flipYInput.checked
                })
            });
        });
    }
}

export type UpdateSpriteLayout = {
    id: number,
    width: number,
    height: number,
    zindex: number,
    alpha: number,
    posX: number,
    posY: number,
    anchorX: number,
    anchorY: number
}

export type FlipLayout = {
    id: number,
    flipX: boolean,
    flipY: boolean
}