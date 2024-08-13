enum RectEdges{
  NONE = -1,
  TOP,
  BOTTOM,
  LEFT,
  RIGHT
}

class RectBounds{
  x: number;
  y: number;
  width: number;
  height: number;

  constructor( x: number, y: number, width: number, height: number ){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  pointWithinBox( x: number, y: number ): boolean {
    return (
      this.x < x &&
      this.y < y &&
      this.x + this.width > x &&
      this.y + this.height > y
    )
  }

  pointOnEdgeOfBox( x: number, y: number ){
    if(
      this.x < x &&
      this.y < y &&
      this.x + 10 > x &&
      this.y + this.height > y
    ) return RectEdges.LEFT;

    if(
      this.x + this.width - 10 < x &&
      this.y < y &&
      this.x + this.width > x &&
      this.y + this.height > y
    ) return RectEdges.RIGHT;

    if(
      this.x < x &&
      this.y < y &&
      this.x + this.width > x &&
      this.y + 10 > y
    ) return RectEdges.TOP;

    if(
      this.x < x &&
      this.y + this.height - 10 < y &&
      this.x + this.width > x &&
      this.y + this.height > y
    ) return RectEdges.BOTTOM;

    return RectEdges.NONE
  }
}

export { RectBounds, RectEdges }