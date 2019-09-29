import { FilteredSelectElement } from '../components';
import { UiUtils, Utils } from '../utils';

console.log("ui init start");
const { ONE_DEGREE } = Utils;
const { getElement, getInputElement, getDivElement, getCanvasElement } = UiUtils;

export const elFonts = UiUtils.getSelectElement("fonts");
export const elPause = getInputElement("pause");
export const backCanvas = getCanvasElement("backcanvas");
export const canvas = getCanvasElement("canvas");
export const ctxBack = backCanvas.getContext("2d") || new CanvasRenderingContext2D();
export const ctx = canvas.getContext("2d") || new CanvasRenderingContext2D();

export const elReset = getInputElement("reset");
export const elTickScale = getInputElement("tickscale");
export const elTickAngle = getInputElement("tickangle");
export const elGridColor = getInputElement("gridcolor");
export const elGridBackground = getInputElement("gridbackground");
export const elDebugLog = getInputElement("debuglog");
export const elDebugDetail = getInputElement("debugdetail");
export const elDebugEvents = getInputElement("debugevents");
export const elDebugVectors = getInputElement("debugvectors");
export const elDebugTexts = getInputElement("debugtexts");

export const elOperationsContainer = getDivElement("operationscontainer");
export const elCalculationsContainer = getDivElement("calculationscontainer");

export const elVectors = getFilteredSelect("vectors");
export const elVectorProps = getDivElement("vectorprops");
// export const elVectorProps = getFilteredSelect("vectorprops");
// export const elVectorX = getValueSelect("vectorx");
// export const elVectorY = getValueSelect("vectory");
// export const elVectorW = getValueSelect("vectorw");
// export const elVectorValue = getValueSelect("vectorvalue");
// export const elVectorAngle = getValueSelect("vectorangle");
// export const elVectorMag = getValueSelect("vectormag");
// export const elVectorColor = getValueSelect("vectorcolor");
// export const elVectorWidth = getValueSelect("vectorwidth");
// export const elVectorOpacity = getValueSelect("vectoropacity");
// export const elVectorOrigin = getValueSelect("vectororigin");
// export const elVectorEnd = getValueSelect("vectorend");
// export const elVectorRotate = getInputElement("vectorrotate");
// export const elVectorRotStep = getValueSelect("vectorrotstep");
// export const elVectorVisible = getInputElement("vectorvisible");
export const elVectorName = getInputElement("vectorname");
export const elVectorAdd = getInputElement("vectoradd");
export const elVectorDelete = getInputElement("vectordelete");

export const elTexts = getFilteredSelect("texts");
export const elTextProps = getDivElement("textprops");
// export const elTextProps = getFilteredSelect("textprops");
// export const elTextValue = getValueSelect("textvalue");
// export const elTextRound = getInputElement("textround");
// export const elTextRoundTo = getInputElement("textroundto");
// export const elTextSize = getValueSelect("textsize");
// export const elTextAngle = getValueSelect("textangle");
// export const elTextColor = getValueSelect("textcolor");
// export const elTextOpacity = getValueSelect("textopacity");
// export const elTextPosition = getValueSelect("textposition");
// export const elTextAlign = getSelectElement("textalign");
// export const elTextShow = getInputElement("textshow");
export const elTextName = getInputElement("textname");
export const elTextAdd = getInputElement("textadd");
export const elTextDelete = getInputElement("textdelete");

export const elOperations = getFilteredSelect("operations");
export const elCalculations = getDivElement("calculations");
export const elOperationAdd = getDivElement("operationadd");

/*********************************************************************************************/
/* Utils
/*********************************************************************************************/
function getFilteredSelect(id: string) { return getElement<FilteredSelectElement>(id); }
// function getValueSelect(id: string) { return getElement<ValueSelectElement>(id); }

export function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
}

function setCanvasPosition() {
  var rect = backCanvas.getBoundingClientRect();
  canvas.style.top = rect.top + "px";
  canvas.style.left = rect.left + "px";
}

export function setTransform() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
  ctx.rotate(+elTickAngle.value * ONE_DEGREE);
  ctx.scale(tickScale, tickScale);
  ctx.scale(1, -1);
}

export function clearTransform() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawGrid() {
  const center = canvas.width * 0.5;
  const extent = (canvas.width - center) / tickScale;
  const min = center - extent * tickScale;
  const max = center + extent * tickScale;
  // console.log(extent);

  const ctx = ctxBack;
  ctx.save();
  ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
  ctx.rotate(+elTickAngle.value * ONE_DEGREE);
  ctx.translate(-canvas.width * 0.5, -canvas.height * 0.5);
  ctx.beginPath();
  ctx.strokeStyle = gridColor;
  ctx.fillStyle = gridBackground;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y <= extent; y++) {
    if (y % 5 === 0) {
      ctx.lineWidth = 0.8;
      // ctx.globalAlpha = 0.6;
    } else {
      ctx.lineWidth = 0.4;
      // ctx.globalAlpha = 0.2;
    }

    ctx.beginPath();
    line(ctx, min, center + y * tickScale, max, center + y * tickScale);
    ctx.stroke();

    ctx.beginPath();
    line(ctx, min, center - y * tickScale, max, center - y * tickScale);
    ctx.stroke();

    for (let x = 0; x <= extent; x++) {
      if (x % 5 === 0) {
        ctx.lineWidth = 0.3;
        // ctx.globalAlpha = 0.2;
      } else {
        ctx.lineWidth = 0.2;
        // ctx.globalAlpha = 0.1;
      }

      ctx.beginPath();
      line(ctx, x * tickScale + center, min, x * tickScale + center, max);
      ctx.stroke();

      ctx.beginPath();
      line(ctx, center - x * tickScale, min, center - x * tickScale, max);
      ctx.stroke();
    }
  }

  // ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 1;

  ctx.beginPath();
  line(ctx, center, min, center, max);
  ctx.stroke();

  ctx.beginPath();
  line(ctx, min, center, max, center);
  ctx.stroke();

  ctx.lineWidth = 3.5;

  ctx.beginPath();
  line(ctx, center, center, center, min);
  ctx.stroke();

  ctx.beginPath();
  line(ctx, center, center, max, center);
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(min, min, max - min, max - min);
  ctx.stroke();

  ctx.restore();
}

function updateCanvasSize() {
  let size = Math.min(window.innerWidth, window.innerHeight) - 50;
  size = Math.min(size, 500);
  // size = Math.min(size, 150);
  canvas.width = size;
  canvas.height = size;
  backCanvas.width = size;
  backCanvas.height = size;
  setCanvasPosition();

  elOperationsContainer.style.maxHeight = size + "px";
  elCalculationsContainer.style.maxHeight = size - 5 + "px";
  elOperations.size = Math.max(+elOperationsContainer.clientHeight / 23, 5);

  // elVectorProps.size = elOperations.size;
  elVectorProps.style.maxHeight = size - 5 + "px";

  // elTextProps.size = elOperations.size;
  elTextProps.style.maxHeight = size - 5 + "px";

  // elVectorMag.max = new Vec(size / tickScale, size / tickScale).magnitude / 2;
  drawGrid();
}

function updateCanvas() {
  tickScale = elTickScale.valueAsNumber;
  gridColor = elGridColor.value;
  gridBackground = elGridBackground.value;
  updateCanvasSize();
}

/*********************************************************************************************/
/* Event handling
/*********************************************************************************************/
elGridColor.addEventListener("change", updateCanvas);
elGridBackground.addEventListener("change", updateCanvas);
elTickScale.addEventListener("input", updateCanvas);
elTickAngle.addEventListener("input", updateCanvas);
window.addEventListener("scroll", setCanvasPosition);

/*********************************************************************************************/
/* Initialize
/*********************************************************************************************/
export let tickScale = 20;
let gridColor: string = elGridColor.value;
let gridBackground: string = elGridBackground.value;

export function Initialize() {
  updateCanvasSize();
}

updateCanvasSize();
console.log("ui init end");
