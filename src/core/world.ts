import { Category, IWorld, setWorld, Tristate, Vec } from '.';
import { FilteredSelectElement, ValueSelectElement } from '../components';
import * as D from '../decorators/dlog';
import { ChangeArgs } from '../event-args';
import {
  BaseObject,
  DrawObject,
  FilteredList,
  IFilteredList,
  ListEventArgs,
  ListSelectedItemChangedArgs,
  ObjectFilter,
  TextObject,
  UpdatableObject,
  Value,
  VectorObject,
} from '../objects';
import * as ui from '../ui';
import { Utils } from '../utils';
import { CaptionMode } from './types';

console.log("world init start");
const { TWO_PI, ONE_DEGREE, checkType } = Utils;

// ComponentBase; FilteredSelectElement; TransformValueElement; ValueSelectElement;
// let skippedRenderCount = 0;

//*
let DEBUG_EVENTS = false;
let DEBUG_VECTORS = false;
let DEBUG_TEXTS = false;
D.setDLogActive(false);
D.setDetailMode(false);
/*/
let DEBUG_EVENTS = true;
let DEBUG_VECTORS = false;
let DEBUG_TEXTS = false;
D.setDLogActive(true);
D.setDetailMode(true);
//*/

// @D.dlogged({ methodSetLogIf: () => true, logAllMethods: true })
class World implements IWorld {
  constructor() {
  }

  get origin() { return origin; }

  get debugLogActive() { return D.isDLogActive(); }
  set debugLogActive(value) { D.setDLogActive(value); }
  get debugDetail() { return D.isDetailMode(); }
  set debugDetail(value) { D.setDetailMode(value); }
  get debugEvents() { return DEBUG_EVENTS; }
  set debugEvents(value) { DEBUG_EVENTS = value; }
  get debugVectors() { return DEBUG_VECTORS; }
  set debugVectors(value) { DEBUG_VECTORS = value; }
  get debugTexts() { return DEBUG_TEXTS; }
  set debugTexts(value) { DEBUG_TEXTS = value; }

  readonly addFilteredLists = addFilteredLists;
  readonly addObjects = addObjects;
  readonly removeObjects = removeObjects;
  readonly getUniqueText = getUniqueText;
  readonly getUniqueName = getUniqueName;
  readonly getUniqueCaption = getUniqueCaption;

  initialize() {
    initializeLists();
    initializeEventHandlers();

    ui.elOperations.filteredList = <IFilteredList>operations;
    ui.elVectors.filteredList = <IFilteredList>vectors;
    ui.elTexts.filteredList = <IFilteredList>textObjects;

    reset();
    requestAnimationFrame(animationLoop);
  }

  convertThickness(thickness: number): number {
    return thickness / ui.tickScale;
  }

  drawVector(ctx: CanvasRenderingContext2D, vec: Vec, origin: Vec, lineWidth: number, opacity: number, color: string) {
    const mag = vec.magnitude;
    const triHeight = Math.min(mag / 7, 1);
    const angle = -90 * ONE_DEGREE + vec.angle;
    const isPoint = vec.w !== 0;
    ctx.save();

    ctx.globalAlpha = opacity;
    ui.setTransform();
    ctx.translate(origin.x, origin.y);
    ctx.rotate(angle);
    ctx.beginPath();

    if (isPoint)
      ctx.arc(0, mag, lineWidth * 2 / ui.tickScale, 0, TWO_PI);
    else
      ui.line(ctx, 0, 0, 0, mag - triHeight);

    ui.clearTransform();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.fill();
    ctx.stroke();

    if (!isPoint) {
      ui.setTransform();
      ctx.translate(origin.x, origin.y);
      ctx.translate(vec.x, vec.y);
      ctx.rotate(angle);
      ctx.translate(0, -triHeight);
      ctx.beginPath();
      ctx.moveTo(0, triHeight);
      ctx.lineTo(-triHeight * 0.5, 0);
      ctx.lineTo(triHeight * 0.5, 0);
      ctx.lineTo(0, triHeight);
      ui.clearTransform();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      ctx.fill();
    }

    ctx.restore();
  }

  drawText(ctx: CanvasRenderingContext2D, text: string, position: Vec, align: string, angle: number, size: number, opacity: number, color: string) {
    ctx.font = size + "px Arial";
    let x = position.x;
    let y = -position.y;
    x *= ui.tickScale;
    y *= ui.tickScale;

    ctx.save();
    ui.clearTransform();
    ctx.translate(ui.canvas.width * 0.5, ui.canvas.height * 0.5);
    ctx.rotate(+ui.elTickAngle.value * ONE_DEGREE);

    ctx.translate(x, y);
    ctx.rotate(-angle * ONE_DEGREE);
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.textAlign = align as CanvasTextAlign;
    ctx.globalAlpha = opacity;
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }
}

console.log("setting world");
const me = new World();
setWorld(me);
console.log(`finished setting world: `);

/*********************************************************************************************/
/* List handling
/*********************************************************************************************/
// let selectedOperation: Tristate<Operation>;
let selectedVector: Tristate<VectorObject>;
let selectedTextObject: Tristate<TextObject>;
let selectedVectorProps: HTMLDivElement;
let selectedTextObjectProps: HTMLDivElement;

let filteredLists: FilteredList<BaseObject>[];
let objects: FilteredList<BaseObject>;
let updatables: FilteredList<BaseObject>;
let drawObjects: FilteredList<BaseObject>;
let operations: FilteredList<BaseObject>;
let calculations: FilteredList<BaseObject>;
let vectors: FilteredList<BaseObject>;
let textObjects: FilteredList<BaseObject>;
let propertyElements: Map<BaseObject, HTMLDivElement>;

function initializeLists() {
  filteredLists = [];
  propertyElements = new Map<BaseObject, HTMLDivElement>();

  objects = new FilteredList<BaseObject>(() => true);
  updatables = new FilteredList<BaseObject>((obj: BaseObject) => obj instanceof UpdatableObject);
  drawObjects = new FilteredList<BaseObject>((obj: BaseObject) => obj instanceof DrawObject);
  operations = new FilteredList<BaseObject>((obj: BaseObject) => obj.category === Category.operation && obj.isGlobal);
  calculations = new FilteredList<BaseObject>((obj: BaseObject) => obj.category === Category.calculation && obj.isGlobal);
  vectors = new FilteredList<BaseObject>((obj: BaseObject) => obj instanceof VectorObject && obj.isGlobal);
  textObjects = new FilteredList<BaseObject>((obj: BaseObject) => obj instanceof TextObject && obj.isGlobal);

  filteredLists.push(
    objects,
    updatables,
    drawObjects,
    operations,
    calculations,
    vectors,
    textObjects);
}

function checkSelection(...lists: FilteredList<BaseObject>[]) {
  for (const list of lists) {
    if (list.length === 1 && list.selectedIndex < 0)
      list.selectedIndex = 0;
  }
}

function addObjectToLists(obj: BaseObject, lists: FilteredList<BaseObject>[], hookChange: boolean = true) {
  // hookChange && console.log(`addObjectToLists: hooking change "${obj["propertyName"] || obj.name}"`);
  hookChange && obj.onChanged(handleObjectChanged);
  lists.forEach(list => list.add(obj));

  checkSelection(operations, vectors, textObjects);
}

function removeObjectFromLists(obj: BaseObject, lists: FilteredList<BaseObject>[]) {
  obj.offChanged(handleObjectChanged);
  lists.forEach(list => list.remove(obj));
}

function addObjectsToLists(objs: BaseObject[], lists: FilteredList<BaseObject>[], hookChange: boolean = true) {
  objs.forEach(obj => addObjectToLists(obj, lists, hookChange));
}

function removeObjectsFromLists(objs: BaseObject[], lists: FilteredList<BaseObject>[]) {
  objs.forEach(obj => removeObjectFromLists(obj, lists));
}

function addFilteredLists(...lists: FilteredList<BaseObject>[]) {
  filteredLists.push(...lists);
  addObjectsToLists(objects.items, lists, false);
}

function removeFilteredLists(...lists: FilteredList<BaseObject>[]) {
  for (const list of lists) {
    filteredLists.remove(list);
  }
}

function addObjects(...objs: BaseObject[]) {
  forceRender = true;
  addObjectsToLists(objs, filteredLists);
  objs.forEach(obj => obj.addDisposable(Utils.disposable(() => removeObjects(obj))));
}

function removeObjects(...objs: BaseObject[]) {
  forceRender = true;
  removeObjectsFromLists(objs, filteredLists);
}

// @ts-ignore - unused param.
function handleObjectChanged(e: ChangeArgs) { changed = true; }

function update() {
  updatables.items.forEach(obj => (<UpdatableObject>obj).update());

  if (changed || forceRender) {
    // logc`update: changed ${changed}, force ${forceRender}`;
    // console.log(drawObjects.items);
    ui.ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
    ui.setTransform();
    drawObjects.items.forEach(obj => (<DrawObject>obj).render(ui.ctx));
    ui.clearTransform();
  }
  // else {
  //   skippedRenderCount++;

  //   // if ((frame % 60) === 0)
  //   //   console.log("***** skipped render");
  // }

  changed = false;
  forceRender = false;
}

/*********************************************************************************************/
/* Properties Handling
/*********************************************************************************************/
function handleSelectedVectorChanged(e: ListEventArgs) {
  if (!(e instanceof ListSelectedItemChangedArgs)) return;
  // console.log("******** SelectedVectorChanged");

  const selected = <VectorObject>checkType(VectorObject, vectors.value);

  if (selected === selectedVector) return;

  // D.setIsDLog(true);
  selectedVector = selected;
  selectedVectorProps = getObjectProps(selectedVector);
  clearElementChildren(ui.elVectorProps);
  addElementChildren(ui.elVectorProps, selectedVectorProps);
  // D.setIsDLog(false);
}

function handleSelectedTextObjectChanged(e: ListEventArgs) {
  if (!(e instanceof ListSelectedItemChangedArgs)) return;
  // console.log("******** SelectedTextObjectChanged");

  const selected = <TextObject>checkType(TextObject, textObjects.value);

  if (selected === selectedTextObject) return;

  selectedTextObject = selected;
  selectedTextObjectProps = getObjectProps(selectedTextObject);
  clearElementChildren(ui.elTextProps);
  addElementChildren(ui.elTextProps, selectedTextObjectProps);
}

function getObjectProps(obj: BaseObject) {
  let props = propertyElements.get(obj);

  if (!props) {
    const propsList = createPropertyList(obj);
    propsList.captionMode = CaptionMode.title;
    addFilteredLists(propsList);
    props = createPropertiesElements(propsList);
    propertyElements.set(obj, props);
    obj.addDisposable(Utils.disposable(() => propertyElements.delete(obj)));
  }

  return props;
}

function clearElementChildren(element: HTMLElement) {
  let child: Element | null;

  while (child = element.lastElementChild) {
    element.removeChild(child);
  }
}

function addElementChildren(element: HTMLElement, ...children: Element[]) {
  children.forEach(child => element.appendChild(child));
}

function createPropertyList(obj: BaseObject) {
  return new FilteredList<BaseObject>(o => o instanceof Value && o.owner === obj && o.isGlobal);
}

function addPropertyElements(elements: HTMLElement[], property: Value<any>, useTitle: boolean = false) {
  const label = document.createElement("label");
  const select = <ValueSelectElement>document.createElement("value-select");
  property.addDisposable(Utils.disposable(() => document.removeChild(select)));

  label.className = "inputlbl";
  label.innerText = useTitle ? `${property.title}:` : `${property.caption}:`;

  elements.push(label, select);

  const assignValueToElement = () => {
    // D.setIsDLog(property.propertyName === "u.x");
    // D.setIsDLog(property.name === "opacity");
    property.assignTo(select);
    D.setIsDLog(false);
  }

  const assignElementToValue = (e: Event) => {
    if (e instanceof CustomEvent && e.detail === "HACK") return;

    D.setIsDLog(property.propertyName === "u.x");
    property.assignFrom(select);
    D.setIsDLog(false);
  }

  let registered = false;

  const handleConnected = () => {
    // if (property.propertyName === "u.x" || property.propertyName.startsWith("v"))
    // if (property.propertyName === "u_label.opacity")
    //   console.log(`*****Connected ${property.propertyName}`);

    if (!registered) {
      assignValueToElement();
      registerElement(select, property);
      registered = true;
    }

    assignValueToElement();
    select.addEventListener("input", assignElementToValue);
    select.addEventListener("change", assignElementToValue);
    property.onSettingsChanged(assignValueToElement);
  };

  const handleDisonnected = () => {
    // if (property.propertyName === "u.x" || property.propertyName.startsWith("v"))
    // if (property.propertyName === "u_label.opacity")
    //   console.log(`*****Disconnected ${property.propertyName}`);
    select.removeEventListener("input", assignElementToValue);
    select.removeEventListener("change", assignElementToValue);
    property.offSettingsChanged(assignValueToElement);
  };

  // Web Components does not hook up the shadow DOMS for nested Components
  // immediately on creation. Wait until connected to access nested
  // component elements.
  select.addEventListener("connectall", handleConnected);
  select.addEventListener("disconnect", handleDisonnected);
}

function createPropertiesElements(properties: FilteredList<BaseObject>) {
  const result = document.createElement("div");
  result.className = "gridhoriz2";
  const elements: HTMLElement[] = [];
  const useTitle = properties.captionMode === CaptionMode.title;

  properties.items.forEach(item => {
    const value = checkType(Value, <Value<any>>item);

    // if (value && value.name === "opacity")
    if (value)
      addPropertyElements(elements, value, useTitle);
  });

  addElementChildren(result, ...elements);
  return result;
}

/*********************************************************************************************/
/* Registration/Filtering
/*********************************************************************************************/
function createFilterList(property: Value<any>, e: FilteredSelectElement) {
  let filter: ObjectFilter = o => o.isLocal
    && o.category === e.category
    && ((o.valueType & e.allowedValueTypes) !== 0)
    && (e.allowOwnerAsSource || o.owner != property.owner);

  const list = new FilteredList<BaseObject>(filter);
  e.includeEmptyItem = true;
  e.filteredList = list;
  return list;
}

function createFilterLists(property: Value<any>, ...elements: FilteredSelectElement[]) {
  return elements.map(element => createFilterList(property, element));
}

function registerElement(element: ValueSelectElement, property: Value<any>) {
  const lists = createFilterLists(property, ...element.filteredSelects);
  addFilteredLists(...lists);
  property.addDisposable(Utils.disposable(() => removeFilteredLists(...lists)));
}

/*********************************************************************************************/
/* Animation Loop
/*********************************************************************************************/
function animationLoop() {
  // try {
  // requestAnimationFrame(animationLoop);
  // frame++;

  if (!ui.elPause.checked) {
    ui.ctx.save();
    update();
    // ui.elReset.value = "" + frame;
    ui.ctx.restore();
  }

  if (frame === 0) {
    // me.debugEvents = false;
  }

  if (frame === 10) {
    // ui.elPause.checked = true;
    // return;
  }

  requestAnimationFrame(animationLoop);
  frame++;
  // } catch (e) {
  //   console.log(e.message);
  // }
}

/*********************************************************************************************/
/* Hook Event Listeners
/*********************************************************************************************/
function handleReset() {
  forceRender = true;
  reset();
  update();
}

function forceUpdate() {
  forceRender = true;
  update();
}

function initializeEventHandlers() {
  window.addEventListener("resize", forceUpdate);
  ui.elReset.addEventListener("click", handleReset);
  ui.elTickScale.addEventListener("input", forceUpdate);
  ui.elTickAngle.addEventListener("input", forceUpdate);

  ui.elDebugLog.checked = me.debugLogActive;
  ui.elDebugDetail.checked = me.debugDetail;
  ui.elDebugEvents.checked = me.debugEvents;
  ui.elDebugVectors.checked = me.debugVectors;
  ui.elDebugTexts.checked = me.debugTexts;
  ui.elDebugLog.addEventListener("input", () => me.debugLogActive = ui.elDebugLog.checked);
  ui.elDebugDetail.addEventListener("input", () => me.debugDetail = ui.elDebugDetail.checked);
  ui.elDebugEvents.addEventListener("input", () => me.debugEvents = ui.elDebugEvents.checked);
  ui.elDebugVectors.addEventListener("input", () => me.debugVectors = ui.elDebugVectors.checked);
  ui.elDebugTexts.addEventListener("input", () => me.debugTexts = ui.elDebugTexts.checked);

  vectors.onListChanged(handleSelectedVectorChanged);
  textObjects.onListChanged(handleSelectedTextObjectChanged);
  console.log(`world: added event listeners`);
}

/*********************************************************************************************/
/* Utils
/*********************************************************************************************/
function getUniqueText(category: Category, predicate: (obj: BaseObject, text: string) => boolean, text: string) {
  if (!objects) return text;

  let result = text;
  const filter = (obj: BaseObject, txt: string) => obj.category === category && predicate(obj, txt);
  let items = objects.items;
  let i = 1;

  while (items.find(obj => filter(obj, result))) {
    result = `${text}_${i++}`;
  }

  return result;
}

function getUniqueName(category: Category, text: string) {
  return getUniqueText(category, (o, name) => o.name === name, text);
}

function getUniqueCaption(category: Category, text: string) {
  return getUniqueText(category, (o, caption) => o.caption === caption, text);
}

function createVectorObject(name: string, v: Vec, hidden: boolean = false, origin: boolean = false): VectorObject {
  name = getUniqueName(Category.vectorObject, name);
  const vo = new VectorObject(name, v, origin);
  vo.isGlobal = !hidden;
  return vo;
}

/*********************************************************************************************/
/* Initialize
/*********************************************************************************************/
function reset() {
  console.log(`world: reset`);
  calculations.items.forEach(obj => obj.dispose());
  vectors.items.forEach(obj => obj.dispose());
  textObjects.items.forEach(obj => obj.dispose());

  origin = createVectorObject("origin", new Vec(0, 0, 1), true, true);
  me.addObjects(origin);

  const u = createVectorObject("u", new Vec(3, 3, 0), false);
  u.color.value = "#000000";
  // u.lineWidth.asNumber = 1;
  // u.opacity.asNumber = 0.5;
  // u.rotate = true;
  me.addObjects(u);
  const v = createVectorObject("v", new Vec(-4, 1, 0), false);
  // const v = createVectorObject("v", new Vec(1, 0, 0), false, true);
  me.addObjects(v);
  /*
  const res = createVectorObject("result", new Vec(0, 0, 0), false);
  res.color.text = "#009900";
  res.visible.value = false;
  me.addObjects(res);
  const par = createVectorObject("par", new Vec(0, 0, 0), false);
  par.color.text = "#004000";
  par.lineWidth.value = 5;
  par.opacity.value = 0.5;
  par.visible.value = false;
  me.addObjects(par);
  const tan = createVectorObject("tan", new Vec(0, 0, 0), false);
  tan.color.text = "#800000";
  tan.lineWidth.value = 5;
  tan.opacity.value = 0.6;
  tan.visible.value = false;
  addObjects(tan);
  //*/
}

ui.elPause.checked = false;
let origin: VectorObject;
let changed = false;
let forceRender = false;
let frame = 0;

console.log("world init end");
