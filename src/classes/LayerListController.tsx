import { Setter } from "solid-js";
import { layersToHTMLElement, layerToHTMLElement } from "../util/layerToHTMLElement";
import { Layer } from "./Layer";
import { propertiesFromLayer } from "../util/propertiesFromLayer";

class LayerListController{
  container: HTMLElement;
  layers: Array<Layer>;

  layerHTMLElements: Array<HTMLElement>;

  ghostLayer: HTMLElement;
  ghostLayerStart: number = 0;
  ghostLayerMouseStart: number = 0;
  
  setLayerProperties: ( el: HTMLElement ) => HTMLElement;
  selectedLayer: number = -1;

  dragFromLayer: number = -1;
  lastLayerOver: number = -1;

  isDraging = false;

  constructor( container: HTMLElement, setLayerProperties: Setter<HTMLElement> ){
    this.container = container;
    this.layers = [ Layer.BackgroundLayer ];
    this.layerHTMLElements = layersToHTMLElement(this.layers);
    this.setLayerProperties = setLayerProperties;

    this.ghostLayer = <div class="layer ghost-layer">&nbsp;</div> as HTMLElement;

    window.addEventListener('mouseup', () => {
      if(!this.isDraging)return;

      this.isDraging = false;
      window.onmousemove = () => {};

      this.ghostLayer.style.transform = `translateY(${ 40 * this.lastLayerOver }px)`;

      if(this.dragFromLayer === this.lastLayerOver){
        this.ghostLayer.innerHTML = '&nbsp';
        return;
      }

      setTimeout(() => {
        let savedLayerHTML = this.layerHTMLElements[this.dragFromLayer];
        
        this.layerHTMLElements.splice(this.dragFromLayer, 1);
        this.layerHTMLElements.splice(this.lastLayerOver, 0, savedLayerHTML);

        let savedLayer = this.layers[this.dragFromLayer];

        this.layers.splice(this.dragFromLayer, 1);
        this.layers.splice(this.lastLayerOver, 0, savedLayer);

        this.ghostLayer.innerHTML = '&nbsp';
        this.render();
      }, 100);
    })

    this.render();
  }

  select( layer: number ){
    this.selectedLayer = layer;
    this.layerHTMLElements.forEach(el => el.classList.remove('selected-layer'));

    if(layer !== -1){
      this.layerHTMLElements[layer].classList.add('selected-layer');
      this.setLayerProperties(propertiesFromLayer(this.layers[layer]));
    } else{
      this.setLayerProperties(<>No Layer Selected</> as HTMLElement);
    }
  }

  render(){
    this.container.innerHTML = '';

    this.container.appendChild(this.ghostLayer);

    this.layerHTMLElements.forEach((l, i) => {
      this.container.appendChild(l);

      l.onclick = () => {
        this.select(i);
      }

      l.onmouseover = () => {
        this.lastLayerOver = i;
      }

      l.onmousedown = ( e ) => {
        this.isDraging = true;
        this.dragFromLayer = i;

        this.ghostLayerStart = 40 * i;
        this.ghostLayerMouseStart = e.clientY;

        this.ghostLayer.innerHTML = l.innerHTML;
        this.ghostLayer.style.transform = `translateY(${ this.ghostLayerStart }px)`;

        window.onmousemove = ( e ) => {
          let diff = e.clientY - this.ghostLayerMouseStart;
          this.ghostLayer.style.transform = `translateY(${ this.ghostLayerStart + diff }px)`
        };
      }
    })
  }

  addLayer( layer: Layer ){
    this.layers.push(layer);
    this.layerHTMLElements.push(layerToHTMLElement(layer));

    this.render();
  }

  removeLayer( index: number ){
    this.layers.splice(index, 1);
    this.layerHTMLElements.splice(index, 1);

    this.render();
  }
}

export { LayerListController }