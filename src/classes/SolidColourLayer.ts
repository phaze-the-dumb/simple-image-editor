import { Layer, LayerType } from "./Layer";
import { RectBounds } from "./RectBounds";

class SolidColourLayer extends Layer{
  type: LayerType = LayerType.SOLID_COLOUR;
  colour: string;

  editableProperties: any = { "Colour": "colour" };

  constructor( colour: string ){
    let bounds = new RectBounds(0, 0, 100, 100);
    super(bounds);

    this.colour = colour;
  }

  render( ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement ){
    ctx.fillStyle = this.colour;
    ctx.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
  }
}

export { SolidColourLayer }