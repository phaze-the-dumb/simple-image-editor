import { createSignal, onMount } from "solid-js";
import { Layer } from "./classes/Layer";
import { SolidColourLayer } from "./classes/SolidColourLayer";
import { RectBounds, RectEdges } from "./classes/RectBounds";
import { LayerListController } from "./classes/LayerListController.tsx";
import { TextLayer } from "./classes/TextLayer.ts";

const IMAGE_WIDTH = 720;
const IMAGE_HEIGHT = 1080;

Layer.BackgroundLayer = new SolidColourLayer("#ffffff");
Layer.BackgroundLayer.name = "Background";
Layer.BackgroundLayer.bounds = new RectBounds(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
Layer.BackgroundLayer.selectable = false;

let App = () => {
  let toolIcons: Array<HTMLElement> = [];
  let selectedToolIcon = -1;

  let allowKeyBinds = true;
  
  let lerp  = ( a: number, b: number, t: number ) => a + ( b - a ) * t;

  let canvasScale = window.innerHeight / IMAGE_HEIGHT - 0.1;
  let canvasScaleSmooth = 0;

  let [ canvasScaleReadable, setCanvasScaleReadable ] = createSignal(canvasScale.toFixed(2) + "x");
  let [ layerProperties, setLayerProperties ] = createSignal<HTMLElement>(<>No Layer Selected</> as HTMLElement);

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let canvasContainer: HTMLElement;

  let layerListContainer: LayerListController;

  let isDragDown = false;

  let canvasOffsetX = 0;
  let canvasOffsetY = 0;

  let lastMouseX = 0;
  let lastMouseY = 0;

  let canvasMousePosX = 0;
  let canvasMousePosY = 0;

  let drawStartX = 0;
  let drawStartY = 0;

  let isDrawing = false;

  let isMovingLayer = false;
  let movingSide = RectEdges.NONE;

  let render = () => {
    let rect = canvas.getBoundingClientRect();

    canvasMousePosX = (lastMouseX - rect.x) / canvasScaleSmooth;
    canvasMousePosY = (lastMouseY - rect.y) / canvasScaleSmooth;

    canvas.style.transform = `translate(calc(-50% - ${ canvasOffsetX }px), calc(-50% - ${ canvasOffsetY }px)) scale(${ canvasScaleSmooth })`;
    canvasScaleSmooth = lerp(canvasScaleSmooth, canvasScale, 0.1);

    requestAnimationFrame(render);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layerListContainer.layers.forEach(layer => {
      layer.render(ctx, canvas);
    })

    let hasHover = false;
    for(let i = layerListContainer.layers.length - 1; i >= 0; i--){
      let layer = layerListContainer.layers[i];

      if(layer.selectable){
        let hover: boolean = layer.bounds.pointWithinBox(canvasMousePosX, canvasMousePosY);
        hasHover = hover;

        if(i === layerListContainer.selectedLayer){
          ctx.strokeStyle = '#00ccff';
          ctx.lineWidth = 4;
          ctx.strokeRect(layer.bounds.x, layer.bounds.y, layer.bounds.width, layer.bounds.height);
        }
        
        if(hover){
          let side = layer.bounds.pointOnEdgeOfBox(canvasMousePosX, canvasMousePosY);

          ctx.strokeStyle = '#005599';
          ctx.lineWidth = 4;
        
          movingSide = side;

          switch(side){
            case RectEdges.LEFT:
              ctx.beginPath();
              ctx.moveTo(layer.bounds.x, layer.bounds.y);
              ctx.lineTo(layer.bounds.x, layer.bounds.y + layer.bounds.height);

              ctx.stroke();
              ctx.closePath();
              break;            
            case RectEdges.RIGHT:
              ctx.beginPath();
              ctx.moveTo(layer.bounds.x + layer.bounds.width, layer.bounds.y);
              ctx.lineTo(layer.bounds.x + layer.bounds.width, layer.bounds.y + layer.bounds.height);

              ctx.stroke();
              ctx.closePath();
              break;
            case RectEdges.TOP:
              ctx.beginPath();
              ctx.moveTo(layer.bounds.x, layer.bounds.y);
              ctx.lineTo(layer.bounds.x + layer.bounds.width, layer.bounds.y);

              ctx.stroke();
              ctx.closePath();
              break;            
            case RectEdges.BOTTOM:
              ctx.beginPath();
              ctx.moveTo(layer.bounds.x, layer.bounds.y + layer.bounds.height);
              ctx.lineTo(layer.bounds.x + layer.bounds.width, layer.bounds.y + layer.bounds.height);

              ctx.stroke();
              ctx.closePath();
              break;
            case RectEdges.NONE:
              if(hasHover)return;
              ctx.strokeRect(layer.bounds.x, layer.bounds.y, layer.bounds.width, layer.bounds.height);

              break;
          }
        }
      }
    }

    if(isDrawing){
      switch(selectedToolIcon){
        case 0:
          ctx.fillStyle = '#000';
          ctx.fillRect(drawStartX, drawStartY, canvasMousePosX - drawStartX, canvasMousePosY - drawStartY);
          break;
      }
    }

    ctx.fillStyle = '#f00';
    ctx.fillRect(canvasMousePosX, canvasMousePosY, 5, 5);
  }

  onMount(() => {
    canvasContainer.addEventListener('wheel', ( e ) => {
      e.preventDefault();
      
      if(e.ctrlKey){
        canvasScale += e.deltaY / 2000;

        if(canvasScale < 0.1)canvasScale = 0.1;
        if(canvasScale > 2)canvasScale = 2;

        setCanvasScaleReadable(canvasScale.toFixed(2) + 'x');
      } else if(e.shiftKey){
        canvasOffsetX += e.deltaY / 2;
        canvasOffsetY += e.deltaX / 2;
      } else{
        canvasOffsetX += e.deltaX / 2;
        canvasOffsetY += e.deltaY / 2;
      }
    })

    canvasContainer.addEventListener('contextmenu', ( e ) => {
      e.preventDefault();
    })

    canvasContainer.addEventListener('keydown', ( e ) => {
      if(!allowKeyBinds)return;

      if(e.key === ' ')
        isDragDown = true;
    })

    window.addEventListener('keyup', ( e ) => {
      if(!allowKeyBinds)return;

      if(e.key === ' ')
        isDragDown = false;
      else if(e.key === 'Escape'){
        layerListContainer.select(-1);
        isMovingLayer = false;

        setLayerProperties(<>No Layer Selected</> as HTMLElement);
      } else if(e.key === "Delete" || ( e.key === "X" && e.shiftKey )){
        if(layerListContainer.selectedLayer === -1)return;

        if(layerListContainer.layers[layerListContainer.selectedLayer].selectable){
          layerListContainer.removeLayer(layerListContainer.selectedLayer);
          layerListContainer.select(-1);
        } 
      }
    })

    canvasContainer.addEventListener('mousedown', ( e ) => {
      switch(e.button){
        case 2:
          isDragDown = true;
          break;
        case 0:
          if(selectedToolIcon === -1){
            layerListContainer.select(-1);
            isMovingLayer = false;

            for(let i = layerListContainer.layers.length - 1; i >= 0; i--){
              let layer = layerListContainer.layers[i];
              
              if(layer.selectable && layer.bounds.pointWithinBox(canvasMousePosX, canvasMousePosY)){
                layerListContainer.select(i);
                isMovingLayer = true;

                break;
              }
            }

            if(layerListContainer.selectedLayer !== -1 && layerListContainer.layers[layerListContainer.selectedLayer].selectable){
              isMovingLayer = true;
            }
          } else{
            drawStartX = canvasMousePosX;
            drawStartY = canvasMousePosY;

            isDrawing = true;
          }

          break;
      }
    })

    canvasContainer.addEventListener('mouseup', ( e ) => {
      switch(e.button){
        case 2:
          isDragDown = false;
          break;
        case 0:
          if(!isDrawing){
            if(isMovingLayer){
              isMovingLayer = false;
            }

            break;
          };

          switch(selectedToolIcon){
            case 0:
              let crect = new RectBounds(drawStartX, drawStartY, canvasMousePosX - drawStartX, canvasMousePosY - drawStartY);
              let clayer = new SolidColourLayer('#000000');

              clayer.name = "Square";
              clayer.bounds = crect;

              layerListContainer.addLayer(clayer);

              selectedToolIcon = -1;
              toolIcons.forEach(icon => icon.classList.remove('tool-icon-selected'));
              
              isDrawing = false;
              break;
            case 1:
              let trect = new RectBounds(canvasMousePosX, canvasMousePosY, 0, 0);
              let tlayer = new TextLayer('#000000');

              tlayer.name = "Text";
              tlayer.bounds = trect;

              layerListContainer.addLayer(tlayer);

              selectedToolIcon = -1;
              toolIcons.forEach(icon => icon.classList.remove('tool-icon-selected'));
              
              isDrawing = false;
              break;
          }

          break;
      }
    })

    window.addEventListener('mousemove', ( e ) => {
      if(isDragDown){
        canvasOffsetX += lastMouseX - e.clientX;
        canvasOffsetY += lastMouseY - e.clientY;
      }

      if(isMovingLayer){
        let rect = canvas.getBoundingClientRect();

        let newCanvasMousePosX = (e.clientX - rect.x) / canvasScaleSmooth;
        let newCanvasMousePosY = (e.clientY - rect.y) / canvasScaleSmooth;

        let bounds = layerListContainer.layers[layerListContainer.selectedLayer].bounds;

        switch(movingSide){
          case RectEdges.NONE:
            bounds.x -= canvasMousePosX - newCanvasMousePosX;
            bounds.y -= canvasMousePosY - newCanvasMousePosY;

            break;
          case RectEdges.LEFT:
            bounds.x -= canvasMousePosX - newCanvasMousePosX;
            bounds.width += canvasMousePosX - newCanvasMousePosX;

            if(bounds.width < 1){
              bounds.width = 1;
              bounds.x += canvasMousePosX - newCanvasMousePosX;
            }

            break;
          case RectEdges.RIGHT:
            bounds.width -= canvasMousePosX - newCanvasMousePosX;

            if(bounds.width < 1){
              bounds.width = 1;
            }

            break;
          case RectEdges.TOP:
            bounds.y -= canvasMousePosY - newCanvasMousePosY;
            bounds.height += canvasMousePosY - newCanvasMousePosY;

            if(bounds.height < 1){
              bounds.height = 1;
              bounds.y += canvasMousePosY - newCanvasMousePosY;
            }

            break;
          case RectEdges.BOTTOM:
            bounds.height -= canvasMousePosY - newCanvasMousePosY;

            if(bounds.height < 1){
              bounds.height = 1;
            }

            break;
        }

        canvasMousePosX = newCanvasMousePosX;
        canvasMousePosY = newCanvasMousePosY;
      }

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    })

    canvas.width = IMAGE_WIDTH;
    canvas.height = IMAGE_HEIGHT;

    ctx = canvas.getContext('2d')!;

    requestAnimationFrame(render);
  })

  return (
    <>
      <div style={{
        position: 'fixed',
        left: '0',
        top: '0',
        width: '75%',
        height: 'calc(100% - 20px)',
        background: '#333',
        overflow: 'hidden'
      }} ref={( el ) => canvasContainer = el }>
        <canvas ref={( el ) => canvas = el} style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scale(0.50)'
        }} />
      </div>

      <div style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        width: '75%',
        height: '20px',
        color: 'white',
        background: '#111',
        "font-size": '12px',
        display: 'flex',
        "justify-content": 'center',
        "align-items": 'center'
      }}>
        Image Scale: { canvasScaleReadable() }
      </div>

      <div style={{
        position: 'fixed',
        right: '0',
        top: '0',
        width: '25%',
        height: '100%',
        background: '#555',
        "text-align": 'center'
      }}>
        <div>
          <br />
          
          Layers:<br />
          <div class="layer-list" ref={( el ) => layerListContainer = new LayerListController(el, setLayerProperties) }></div><br />

          <br /><br />
          
          Tools:<br/>
          <div class="toolbar">
            <div class="tool-icon" ref={( el ) => toolIcons[0] = el} onClick={() => {
              if(selectedToolIcon === 0){
                selectedToolIcon = -1;
                toolIcons.forEach(icon => icon.classList.remove('tool-icon-selected'));

                return;
              }

              selectedToolIcon = 0;

              toolIcons.forEach(icon => icon.classList.remove('tool-icon-selected'));
              toolIcons[selectedToolIcon].classList.add('tool-icon-selected');
            }}>
              <img src="./square-solid.svg" />
            </div>
            <div class="tool-icon" ref={( el ) => toolIcons[1] = el} onClick={() => {
              if(selectedToolIcon === 1){
                selectedToolIcon = -1;
                toolIcons.forEach(icon => icon.classList.remove('tool-icon-selected'));

                return;
              }

              selectedToolIcon = 1;

              toolIcons.forEach(icon => icon.classList.remove('tool-icon-selected'));
              toolIcons[selectedToolIcon].classList.add('tool-icon-selected');
            }}>
              <img src="./font-solid.svg" />
            </div>
          </div>

          <br /><br />
          
          Layer Properties:<br />
          <div class="layer-properties" onMouseEnter={() => allowKeyBinds = false} onMouseLeave={() => { allowKeyBinds = true }}>{ layerProperties() }</div>
        </div>
      </div>
    </>
  )
}

export default App
