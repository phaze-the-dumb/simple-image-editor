import { RectBounds } from "./RectBounds";

enum LayerType{
  UNKNOWN = -1,
  SOLID_COLOUR,
  LINEAR_GRADIENT,
  IMAGE,
  TEXT,
}

class Layer{
  static BackgroundLayer: Layer;

  type: LayerType = LayerType.UNKNOWN;
  name: string = "";
  
  editableProperties: any = {};

  selectable: boolean = true;
  bounds: RectBounds;

  render( ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement ){
    ctx.fillStyle = '#f702de';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  constructor( bounds: RectBounds ){
    this.bounds = bounds;
  }
}

export { Layer, LayerType }