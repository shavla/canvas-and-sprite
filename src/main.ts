import { Canvas, PositionUpdater } from './canvas/canvas';
import { AddSpriteInput } from './components/addSpriteInput';
import { CodeDialog } from './components/codeDialog';
import { Dragbar } from './components/dragbar';
import { CanvasLayout, Layout, Tools } from './tools/tools';

let dragbar = new Dragbar();
let addSpriteInput = new AddSpriteInput((info) => {
  canvas.updateSprite(info);
}, (info) => {
  canvas.updateSpriteFlip(info);
}, (id) => {
  canvas.deleteSprite(id);
}, () => {
  tools.getInfo((info: Layout) => {
    canvas.createCanvas(info.canvas);
    canvas.createSprites(info.sprites);
  }, (canvasLayout: CanvasLayout) => {
    canvas.createCanvas(canvasLayout);
  });
});

let tools = new Tools();
let canvas = new Canvas((info: PositionUpdater) => {
  tools.setNewPositions(info);
});
let codeDialog = new CodeDialog();

// let runButton = document.querySelector(".run-button") as HTMLElement;
// runButton.addEventListener("click", () => {
//   tools.getInfo((info: Layout) => {
//     canvas.createCanvas(info.canvas);
//     canvas.createSprites(info.sprites);
//   }, (canvasLayout: CanvasLayout) => {
//     canvas.createCanvas(canvasLayout);
//   });
// });

let codeButton = document.querySelector(".code-button") as HTMLElement;
codeButton.addEventListener("click", () => {
  codeDialog.show();
  let info = canvas.getSpritesLayout();
  codeDialog.setStaticInfo(info);
  codeDialog.setRelativeInfo(info);
});