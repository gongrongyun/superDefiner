import Camera from "../Camera";
import Container from "../Container";
import Map from "../Map";
import Menu from "../Menu";
import Shape from "../Shape";

export default class Board {
    public static id: number = 0;
    public main: Shape;
    public texture: Shape[];
    public draggable: boolean;
    public shadowId: string;
    private id: string;

    constructor(x: number, y: number, alpha: number) {
        this.draggable = false;
        this.main = new Shape();
        this.texture = [];

        for (let i = 0; i < 6; i++) {
            this.texture[i] = new Shape();
            this.texture[i].saveStroke(`rgba(0, 0, 0, ${alpha})`, 2);
        }

        this.main.saveRect(x * Map.blockWidth, y * Map.blockHeight, 6 * Map.blockWidth, 2 * Map.blockHeight);
        this.main.saveFill(`rgba(238, 121, 66, ${alpha})`);
        this.id = "Board" + Board.nextid;
        this.draggable = true;
        this.texture[0].saveArc(x * Map.blockWidth + 180, y * Map.blockHeight - 140, 150, 1.22, 1.93);
        this.texture[1].saveArc(x * Map.blockWidth + 180, y * Map.blockHeight - 130, 150, 1.16, 2.08);
        this.texture[2].saveArc(x * Map.blockWidth + 180, y * Map.blockHeight - 120, 150, 1.16, 2.21);
        this.texture[3].saveArc(x * Map.blockWidth + 60, y * Map.blockHeight + 200, 150, 10.59, 11.64);
        this.texture[4].saveArc(x * Map.blockWidth + 60, y * Map.blockHeight + 210, 150, 10.59, 11.51);
        this.texture[5].saveArc(x * Map.blockWidth + 60, y * Map.blockHeight + 220, 150, 10.63, 11.36);
    }

    public addToMenu() {
        Menu.addChild(this.main);
        for (let i = 0; i < 6; i++) {
            Menu.addChild(this.texture[i]);
        }

        return this;
    }

    public addToContainer() {
        Container.addChild(this.main);
        for ( let i = 0; i < 6; i++) {
            Container.addChild(this.texture[i]);
        }

        return this;
    }

    public clickInMap(x: number, y: number) {
        if (
            x < (this.main.position[0].x + this.main.width) * Camera.scale - Camera.x &&
            x > this.main.position[0].x * Camera.scale - Camera.x
        ) {
            if (
                y < (this.main.position[0].y + this.main.height) * Camera.scale - Camera.y &&
                y > this.main.position[0].y * Camera.scale - Camera.y
            ) {
                if (this.draggable) {
                    return true;
                }
            }
        }
        return false;
    }

    public clickInMenu(x: number, y: number) {
        if (
            x < this.main.position[0].x + this.main.width &&
            x > this.main.position[0].x
        ) {
            if (
                y < this.main.position[0].y + this.main.height &&
                y > this.main.position[0].y
            ) {
                if (this.draggable) {
                    return true;
                }
            }
        }
        return false;
    }

    private static get nextid(): number {
        return Board.id++;
    }

    get uuid(): string {
        return this.id;
    }

    get x(): number {
        if (this.main.position[0]) {
            return this.main.position[0].x * Camera.scale - Camera.x;
        }
    }

    set x(x: number) {
        const disx = (x - this.x) / Camera.scale;
        this.main.position[0].x = (x + Camera.x) / Camera.scale;
        for (let i = 0; i < 6; i++) {
            this.texture[i].position[0].x += disx;
        }
    }

    get y(): number {
        if (this.main.position[0]) {
            return this.main.position[0].y * Camera.scale - Camera.y;
        }
    }

    set y(y: number) {
        const disy = (y - this.y) / Camera.scale;
        this.main.position[0].y = (y + Camera.y) / Camera.scale;
        for (let i = 0; i < 6; i++) {
            this.texture[i].position[0].y += disy;
        }
    }
}
