import * as PIXI from 'pixi.js';
import { CanvasLayout, SpriteCreatorLayout } from '../tools/tools';
import { FlipLayout, UpdateSpriteLayout } from '../components/addSpriteInput';

export class Canvas {
    private pixiApp: PIXI.Application;
    private htmlContainer: HTMLElement = document.querySelector('.canvas-container') as HTMLElement;
    private ratio: number = 1;
    private oldSprites: { id: number, sprite: PIXI.Sprite }[] = [];
    private dragTarget: PIXI.Sprite;
    private isDragging: boolean = false;
    private spriteProperties: { id: number, sprite: PIXI.Sprite, x: number, y: number }[] = [];

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
            let spriteIndex = this.spriteProperties.findIndex(x => x.id == layout.id);
            if (spriteIndex == -1) {
                this.spriteProperties.push({ id: layout.id, x: layout.width / 2, y: layout.height / 2, sprite: sprite });
            }
            this.spriteProperties[this.spriteProperties.findIndex(x => x.id == layout.id)].sprite = sprite;
            console.log(sprite.position);
            sprite.position.set(this.spriteProperties.find(x => x.id == layout.id)?.x, this.spriteProperties.find(x => x.id == layout.id)?.y);
            this.oldSprites.push({ id: layout.id, sprite: sprite });
        }
    }

    getSpritesLayout(): SpriteLayout[] {
        let result: SpriteLayout[] = [];
        for (let i = 0; i < this.oldSprites.length; i++) {
            let sprite = this.oldSprites[i].sprite;
            result.push({
                width: sprite.scale.x > 0 ? sprite.width : -sprite.width,
                height: sprite.scale.y > 0 ? sprite.height : -sprite.height,
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

    updateSprite(info: UpdateSpriteLayout) {
        let spriteProps = this.spriteProperties.find(x => x.id == info.id);
        if (spriteProps) {
            let sprite = spriteProps.sprite;
            sprite.width = info.width * this.ratio;
            sprite.height = info.height * this.ratio;
            sprite.zIndex = info.zindex;
            sprite.alpha = info.alpha;
        }
    }

    updateSpriteFlip(info: FlipLayout) {
        let spriteProps = this.spriteProperties.find(x => x.id == info.id);

        if (spriteProps) {
            let sprite = spriteProps.sprite;
            if (info.flipX) {
                if (sprite._width > 0) {
                    sprite.width = -sprite.width;
                }
            } else {
                if (sprite._width < 0) {
                    sprite.width = -sprite.width;
                    sprite._width = Math.abs(sprite.width);
                }
            }

            if (info.flipY) {
                if (sprite._height > 0) {
                    sprite.height = -sprite.height;
                }
            } else {
                if (sprite._height < 0) {
                    sprite.height = -sprite.height;
                    sprite._height = Math.abs(sprite.height);
                }
            }
        }
    }

    deleteSprite(id: number) {
        let spriteIndex = this.oldSprites.findIndex(x => x.id == id);
        this.oldSprites[spriteIndex].sprite.destroy();
        this.oldSprites.splice(spriteIndex, 1);
    }

    private deleteOldSprites() {
        this.oldSprites.forEach(item => {
            item.sprite.destroy();
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
        console.log(sprite.position);

        sprite.position.set(width / 2, height / 2);
    }

    private setFlipsToSprite(flipX: boolean, flipY: boolean, sprite: PIXI.Sprite) {
        if (flipX) {
            sprite.width = -1;
        }
        if (flipY) {
            sprite.height = -1;
        }
    }

    private addListenerToSprite(sprite: PIXI.Sprite) {
        sprite.eventMode = "static";
        sprite.on('pointerdown', this.onDragStart, this);
    }

    private onDragMove(event: PIXI.FederatedPointerEvent) {
        if (this.isDragging) {
            console.log(this.dragTarget.position);

            this.dragTarget.position.set(event.data.getLocalPosition(this.pixiApp.stage).x, event.data.getLocalPosition(this.pixiApp.stage).y);
        }
    }

    private onDragStart(event: PIXI.FederatedPointerEvent) {
        this.isDragging = true;
        this.dragTarget = event.target as PIXI.Sprite;
        this.pixiApp.stage.on("pointermove", this.onDragMove, this);
    }

    private onDragEnd() {
        this.pixiApp.stage.off("pointermove", this.onDragMove, this);
        this.isDragging = false;
        this.setNewPositionsToProps();
    }

    private setNewPositionsToProps() {
        let index = this.spriteProperties.findIndex(x => x.sprite == this.dragTarget);
        if (index != -1) {
            this.spriteProperties[index].x = this.dragTarget.x;
            this.spriteProperties[index].y = this.dragTarget.y;
        }
    }

    private setCanvasDimensions(width: number, height: number) {
        this.pixiApp.renderer.resize(width, height);
        this.pixiApp.stage.hitArea = this.pixiApp.screen;
    }
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