import { SpriteLayout, } from "../canvas/canvas";

export class CodeDialog {
    private codeDialog: HTMLElement = document.querySelector(".code-container") as HTMLElement;
    private closeButton: HTMLElement = document.querySelector(".close-button") as HTMLElement;
    private staticCodeSnippet: HTMLElement = document.querySelector(".static-code-snippets") as HTMLElement;
    private relativeCodeSnippet: HTMLElement = document.querySelector(".relative-code-snippets") as HTMLElement;
    private copyButtons: NodeListOf<HTMLElement> = document.querySelectorAll(".copy-button");

    constructor() {
        this.closeButton.addEventListener("click", () => {
            this.hide();
        });
        this.addListenersToCopyButtons();
    }

    setStaticInfo(infos: SpriteLayout[]) {
        this.staticCodeSnippet.innerHTML = "";
        for (let i = 0; i < infos.length; i++) {
            let codeContainer = document.createElement("div");
            codeContainer.classList.add("static-code-snippet");

            let info = infos[i];
            let widthDiv = this.createDivWithText("width", +info.width.toFixed(2));
            let heightDiv = this.createDivWithText("height", +info.height.toFixed(2));
            let zIndexDiv = this.createDivWithText("zIndex", +info.zIndex.toFixed(2));
            let alphaDiv = this.createDivWithText("alpha", +info.alpha.toFixed(2));
            let positionDiv = this.createDivWithText("position", `new PIXI.Point(${+info.position.x.toFixed(2)}, ${+info.position.y.toFixed(2)})`);
            let anchorDiv = this.createDivWithText("anchor", `new PIXI.Point(${info.anchorX}, ${info.anchorY})`);
            let scaleDiv = this.createDivWithText("scale", +info.scale.toFixed(2));
            let [title, footer] = this.createSnipetTitleAndFooter(i + 1);

            this.appendChildernToSnippet(codeContainer, [title, widthDiv, heightDiv, alphaDiv, zIndexDiv, positionDiv, anchorDiv, scaleDiv, footer]);
            this.staticCodeSnippet.appendChild(codeContainer);
        }
    }

    setRelativeInfo(infos: SpriteLayout[]) {
        this.relativeCodeSnippet.innerHTML = "";
        for (let i = 0; i < infos.length; i++) {
            let codeContainer = document.createElement("div");
            codeContainer.classList.add("relative-code-snippet");

            let info = infos[i];
            let widthDiv = this.createDivWithText("width", `canvasWidth * ${+(info.width / info.parentWidth).toFixed(2)}`);
            let heightDiv = this.createDivWithText("height", `canvasHeight * ${+(info.height / info.parentHeight).toFixed(2)}`);
            let zIndexDiv = this.createDivWithText("zIndex", info.zIndex);
            let alphaDiv = this.createDivWithText("alpha", info.alpha);
            let positionDiv = this.createDivWithText("position", `new PIXI.Point(canvasWidth * ${+(info.position.x / info.parentWidth).toFixed(2)}, canvasHeight * ${(info.position.y / info.parentHeight).toFixed(2)})`);
            let anchorDiv = this.createDivWithText("anchor", `new PIXI.Point(${info.anchorX}, ${info.anchorY})`);
            let scaleDiv = this.createDivWithText("scale", +info.scale.toFixed(2));
            let [title, footer] = this.createSnipetTitleAndFooter(i + 1);

            this.appendChildernToSnippet(codeContainer, [title, widthDiv, heightDiv, alphaDiv, zIndexDiv, positionDiv, anchorDiv, scaleDiv, footer]);
            this.relativeCodeSnippet.appendChild(codeContainer);
        }
    }

    private createSnipetTitleAndFooter(index: number): HTMLDivElement[] {
        let title = document.createElement("div");
        title.innerHTML = `Sprite ${index}: {`;

        let footer = document.createElement("div");
        footer.innerHTML = "}";
        return [title, footer];
    }

    private appendChildernToSnippet(parent: HTMLDivElement, children: HTMLDivElement[]) {
        children.forEach(child => {
            parent.appendChild(child);
        })
    }

    private createDivWithText(key: string, info: any) {
        let div = document.createElement("div");
        div.innerHTML = `${key}: ${info},`;
        return div;
    }

    private addListenersToCopyButtons() {
        this.copyButtons.forEach(button => {
            button.addEventListener("click", () => {
                this.displayCopied(button);
                let text = button.previousElementSibling ? (button.previousElementSibling as HTMLDivElement).innerText : "";
                navigator.clipboard.writeText(text);
                setTimeout(() => {
                    this.removeCopied(button);
                }, 1500);
            });
        });
    }

    private displayCopied(button: HTMLElement) {
        button.classList.add("copied");
        button.innerText = "Copied ✓";
    }

    private removeCopied(button: HTMLElement) {
        button.classList.remove("copied");
        button.innerText = "Copy";
    }

    show() {
        this.codeDialog.style.display = "flex";
    }

    hide() {
        this.codeDialog.style.display = "none";
    }
}