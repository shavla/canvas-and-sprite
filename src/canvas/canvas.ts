import * as PIXI from 'pixi.js';
import { CanvasLayout, SpriteCreatorLayout } from '../tools/tools';

export class Canvas {
    private pixiApp: PIXI.Application;
    private htmlContainer: HTMLElement = document.querySelector('.canvas-container') as HTMLElement;
    private ratio: number = 1;
    private oldSprites: PIXI.Sprite[] = [];
    private dragTarget: PIXI.Sprite;
    private isDragging: boolean = false;

    constructor() {
        this.pixiApp = new PIXI.Application({
            width: 0,
            height: 0,
        });

        this.pixiApp.stage.sortableChildren = true;
        this.htmlContainer.append(this.pixiApp.view as unknown as Node);
        this.pixiApp.stage.eventMode = "static";
        this.pixiApp.stage.on("pointerup", this.onDragEnd, this);
        this.pixiApp.stage.on("pointerupoutside", this.onDragEnd, this);
    }

    createCanvas(layout: CanvasLayout) {
        this.deleteOldSprites();
        let width = this.htmlContainer.clientWidth;
        let height = this.htmlContainer.clientHeight;
        if (layout.width > width || layout.height > height) {
            this.ratio = Math.min(width / layout.width, height / layout.height);
            this.setCanvasDimensions(layout.width * this.ratio, layout.height * this.ratio);
        } else {
            this.ratio = 1;
            this.setCanvasDimensions(layout.width, layout.height);
        }
        if (layout.width == 0 && layout.height == 0) {
            this.ratio = 1;
            this.setCanvasDimensions(width, height);
        }
        this.pixiApp.renderer.background.color = `0x${layout.color.substring(1)}`;
    }

    createSprites(layouts: SpriteCreatorLayout[]) {
        this.deleteOldSprites();
        for (let i = 0; i < layouts.length; i++) {
            const layout = layouts[i];
            const sprite = new PIXI.Sprite(PIXI.Texture.from(layout.src as PIXI.TextureSource));
            this.setFlipsToSprite(layout.flipX, layout.flipY, sprite);
            this.setDimensionsToSprite(layout.width, layout.height, layout.zindex, layout.alpha, sprite);
            this.addListenerToSprite(sprite);
            this.pixiApp.stage.addChild(sprite);
            this.oldSprites.push(sprite);
        }
    }

    getSpritesLayout(): SpriteLayout[] {
        let result: SpriteLayout[] = [];
        for (let i = 0; i < this.oldSprites.length; i++) {
            let sprite = this.oldSprites[i];
            result.push({
                width: sprite.width,
                height: sprite.height,
                parentWidth: this.pixiApp.renderer.width,
                parentHeight: this.pixiApp.renderer.height,
                position: sprite.position,
                anchor: 0.5,
                zIndex: sprite.zIndex,
                scale: this.ratio,
                alpha: sprite.alpha,
            });
        }
        return result;
    }

    private deleteOldSprites() {
        this.oldSprites.forEach(sprite => {
            sprite.destroy();
        });
        this.oldSprites = [];
    }

    private setDimensionsToSprite(width: number, height: number, zIndex: number, alpha: number, sprite: PIXI.Sprite) {
        sprite.zIndex = zIndex;
        sprite.alpha = alpha;
        if (this.ratio != 1) {
            sprite.width = width * this.ratio;
            sprite.height = height * this.ratio;
        } else {
            sprite.width = width;
            sprite.height = height;
        }
        sprite.anchor.set(0.5);
        sprite.position.set(width / 2, height / 2);
    }

    private setFlipsToSprite(flipX: number, flipY: number, sprite: PIXI.Sprite) {
        sprite.scale.set(flipX, flipY);
    }

    private addListenerToSprite(sprite: PIXI.Sprite) {
        sprite.eventMode = "static";
        sprite.on('pointerdown', this.onDragStart, this);
    }

    private onDragMove(event: PIXI.FederatedPointerEvent): void {
        if (this.isDragging) {
            this.dragTarget.position.set(event.data.getLocalPosition(this.pixiApp.stage).x, event.data.getLocalPosition(this.pixiApp.stage).y);
        }
    }

    private onDragStart(event: PIXI.FederatedPointerEvent): void {
        this.isDragging = true;
        this.dragTarget = event.target as PIXI.Sprite;
        this.pixiApp.stage.on("pointermove", this.onDragMove, this);
    }

    private onDragEnd(): void {
        this.pixiApp.stage.off("pointermove", this.onDragMove, this);
        this.isDragging = false;
    }

    private setCanvasDimensions(width: number, height: number) {
        this.pixiApp.renderer.resize(width, height);
        this.pixiApp.stage.hitArea = this.pixiApp.screen;
    }
}

export type SpriteStaticLayout = {
    position: PIXI.Point,
    width: number,
    height: number,
    anchor: number,
    zIndex: number,
    scale: number,
    alpha: number
}

export type SpriteLayout = {
    width: number,
    height: number,
    parentWidth: number,
    parentHeight: number,
    position: PIXI.Point,
    anchor: number,
    zIndex: number,
    scale: number,
    alpha: number
}