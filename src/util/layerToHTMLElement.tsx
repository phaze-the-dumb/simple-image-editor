import { Layer } from "../classes/Layer";

let layerToHTMLElement = ( layer: Layer ): HTMLElement => {
  return (
    <div class="layer">
      { layer.name }
    </div>
  ) as HTMLElement;
}

let layersToHTMLElement = ( layers: Array<Layer> ): Array<HTMLElement> => {
  let arr: Array<HTMLElement> = [];

  layers.forEach(l => {
    arr.push(layerToHTMLElement(l));
  })

  return arr;
}

export { layerToHTMLElement, layersToHTMLElement };