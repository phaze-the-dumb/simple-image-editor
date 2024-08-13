import { Layer, LayerType } from "./Layer";
import { RectBounds } from "./RectBounds";

class TextLayer extends Layer{
  type: LayerType = LayerType.TEXT;
  colour: string;

  text: string = "Text";
  fontsize: number = 40;

  bold: boolean = false;
  italics: boolean = false;

  editableProperties: any = { "Colour": "colour", "Text": "text", 'FontSize': 'int', "Bold": "bool", "Italics": "bool" };

  constructor( colour: string ){
    let bounds = new RectBounds(0, 0, 100, 100);
    super(bounds);

    this.colour = colour;
  }

  render( ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement ){
    ctx.font = ( this.bold ? "bold " : "" ) + ( this.italics ? "italic " : "" ) + this.fontsize +  "px Arial";
    let size = ctx.measureText(this.text);

    this.bounds.width = size.width;
    this.bounds.height = size.emHeightAscent + size.emHeightDescent;

    ctx.textBaseline = 'top';
    ctx.fillStyle = this.colour;
    ctx.fillText(this.text, this.bounds.x, this.bounds.y);
  }
}

export { TextLayer }