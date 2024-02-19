import * as PIXI from 'pixi.js';
import { CanvasLayout, SpriteCreatorLayout } from '../tools/tools';
import { FlipLayout, UpdateSpriteLayout } from '../components/addSpriteInput';

export class Canvas {
    private pixiApp: PIXI.Application;
    private htmlContainer: HTMLElement = document.querySelector('.canvas-container') as HTMLElement;
    private ratio: number = 1;
    private oldSprites: { id: number, sprite: PIXI.Sprite }[] = [];
    private dragTarget: PIXI.Sprite | null;
    private isDragging: boolean = false;
    private spriteProperties: { id: number, sprite: PIXI.Sprite, x: number, y: number }[] = [];

    constructor(private callback: (info: PositionUpdater) => void) {
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
            this.setDimensionsToSprite({ alpha: layout.alpha, anchorX: layout.anchorX, anchorY: layout.anchorY, height: layout.height, id: i, posX: layout.posX, posY: layout.posY, width: layout.width, zindex: layout.zindex }, sprite);
            this.addListenerToSprite(sprite);
            this.pixiApp.stage.addChild(sprite);
            let spriteIndex = this.spriteProperties.findIndex(x => x.id == layout.id);
            if (spriteIndex == -1) {
                this.spriteProperties.push({ id: layout.id, x: layout.posX, y: layout.posY, sprite: sprite });
            }
            this.spriteProperties[this.spriteProperties.findIndex(x => x.id == layout.id)].sprite = sprite;
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
                anchorX: sprite.anchor.x,
                anchorY: sprite.anchor.y,
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
            sprite.position.x = info.posX;
            sprite.position.y = info.posY;
            sprite.anchor.x = info.anchorX;
            sprite.anchor.y = info.anchorY;
            spriteProps.x = info.posX;
            spriteProps.y = info.posY;
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
        if (spriteIndex != -1) {
            this.oldSprites[spriteIndex].sprite.destroy();
            this.oldSprites.splice(spriteIndex, 1);
        }
    }

    private deleteOldSprites() {
        this.oldSprites.forEach(item => {
            item.sprite.destroy();
        });
        this.oldSprites = [];
    }

    private setDimensionsToSprite(layout: UpdateSpriteLayout, sprite: PIXI.Sprite) {
        sprite.zIndex = layout.zindex;
        sprite.alpha = layout.alpha;
        if (this.ratio != 1) {
            sprite.width = layout.width * this.ratio;
            sprite.height = layout.height * this.ratio;
        } else {
            sprite.width = layout.width;
            sprite.height = layout.height;
        }
        sprite.anchor.set(layout.anchorX, layout.anchorY);
        sprite.position.set(layout.posX, layout.posY);
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
        if (this.isDragging && this.dragTarget) {
            this.dragTarget.position.set(Math.round(event.data.getLocalPosition(this.pixiApp.stage).x), Math.round(event.data.getLocalPosition(this.pixiApp.stage).y));
            let index = this.spriteProperties.findIndex(x => x.sprite == this.dragTarget);
            if (index != -1) {
                this.callback({ id: this.spriteProperties[index].id, posX: this.dragTarget.x, posY: this.dragTarget.y });
            }
        }
    }

    private onDragStart(event: PIXI.FederatedPointerEvent) {
        this.isDragging = true;
        this.dragTarget = event.target as PIXI.Sprite;
        this.pixiApp.stage.on("pointermove", this.onDragMove, this);
    }

    private onDragEnd() {
        this.pixiApp.stage.off("pointermove", this.onDragMove, this);
        this.setNewPositionsToProps();
        this.dragTarget = null;
        this.isDragging = false;
    }

    private setNewPositionsToProps() {
        let index = this.spriteProperties.findIndex(x => x.sprite == this.dragTarget);
        if (index != -1) {
            if (this.dragTarget) {
                this.spriteProperties[index].x = this.dragTarget.x;
                this.spriteProperties[index].y = this.dragTarget.y;
            }
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
    zIndex: number,
    scale: number,
    alpha: number,
    anchorX: number,
    anchorY: number,
}

export type PositionUpdater = {
    id: number,
    posX: number,
    posY: number
}
