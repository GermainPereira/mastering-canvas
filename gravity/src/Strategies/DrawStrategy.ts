import { ICircle } from "../CanvasObjects/Circle";
import { c } from "../Utils/functions";

interface canDraw {
    draw({}: any): void;
}

interface hasDrawStrategy {
    drawStrategy: canDraw;
}

abstract class BaseDrawStrategy {
    public draw(input: any) {
        this.applyDrawStrategy(input);
    }

    protected abstract applyDrawStrategy(input: any): void;
}

class DrawFullCircleStrategy extends BaseDrawStrategy implements canDraw {
    protected applyDrawStrategy({ x, y, radius, color }: ICircle): void {
        c.beginPath();
        c.arc(x, y, radius, 0, Math.PI * 2, false);
        c.fillStyle = color;
        c.fill();
        c.closePath();
    }
}

export { hasDrawStrategy, canDraw, BaseDrawStrategy, DrawFullCircleStrategy };
