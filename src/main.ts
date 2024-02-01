import { Canvas } from './canvas/canvas';
import { AddSpriteInput } from './components/addSpriteInput';
import { CodeDialog } from './components/codeDialog';
import { Dragbar } from './components/dragbar';
import { Layout, Tools } from './tools/tools';

let dragbar = new Dragbar();
let addSpriteInput = new AddSpriteInput();
let canvas = new Canvas();
let tools = new Tools();
let codeDialog = new CodeDialog();

let runButton = document.querySelector(".run-button") as HTMLElement;
runButton.addEventListener("click", () => {
  tools.getInfo((info: Layout) => {
    canvas.createCanvas(info.canvas);
    canvas.createSprites(info.sprites);
  });
});

let codeButton = document.querySelector(".code-button") as HTMLElement;
codeButton.addEventListener("click", () => {
  codeDialog.show();
  let info = canvas.getSpritesLayout();
  codeDialog.setStaticInfo(info);
  codeDialog.setRelativeInfo(info);
});