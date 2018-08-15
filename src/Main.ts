import Camera from "./Camera";
import Container from "./Container";
import * as Goods from "./Goods";
import Map from "./Map";
import Menu from "./Menu";
import Role from "./Role";

export default class Main {
    public keydown: {[key: string]: boolean};
    public roles: {[key: string]: Role};
    private selfId: string;
    private map: Map;
    private touched: boolean;
    private dragingGoods: any;
    private dragList: {[key: string]: any};
    private goodsList: {[key: string]: any};
    private shadowList: {[key: string]: any};
    private pointerX: number;
    private pointerY: number;

    constructor() {
        this.map = new Map();
        this.keydown = {};
        this.roles = {};
        this.dragList = {};
        this.goodsList = {};
        this.shadowList = {};
        this.touched = false;
    }

    public createScene() {
        this.map.createMap();
        this.createRole();
        this.update();

        window.addEventListener("keydown", (event) => { this.keyboardController(event); });
        window.addEventListener("keyup", (event) => { this.keyboardController(event); });
        Menu.goodsCanvas.canvas.addEventListener("mousedown", (event) => { this.dragGoodsBefore(event); });
        Container.mainCanvas.canvas.addEventListener("mousedown", (event) => { this.dragBefore(event); });
        Container.mainCanvas.canvas.addEventListener("touchstart", (event) => { this.dragBefore(event); });
        Container.mainCanvas.canvas.addEventListener("mousemove", (event) => {
            if (this.dragingGoods !== undefined || this.touched) {
                this.dragMove(event);
            }
        });
        Container.mainCanvas.canvas.addEventListener("touchmove", (event) => {
            if (this.dragingGoods !== undefined || this.touched) {
                this.dragMove(event);
            }
        });
        Container.mainCanvas.canvas.addEventListener("mouseup", (event) => { this.dragEnd(event); });
        Menu.goodsCanvas.canvas.addEventListener("mouseup", (event) => {this.dragEnd(event); });
        Container.mainCanvas.canvas.addEventListener("touchend", (event) => { this.dragEnd(event); });

        Container.mainCanvas.canvas.addEventListener("wheel", (event) => { this.zoom(event); });
    }

    private createRole() {
        const role: Role = new Role({ x: 120, y: 1120, moveStep: 5});
        this.roles[role.uuid] = role;
        this.selfId = role.uuid;
    }

    private update() {
        if (this.keydown.KeyA) {
            this.roleMove(this.selfId, "left");
        }
        if (this.keydown.KeyS) {
            this.roleMove(this.selfId, "down");
        }
        if (this.keydown.KeyW) {
            this.roleMove(this.selfId, "up");
        }
        if (this.keydown.KeyD) {
            this.roleMove(this.selfId, "right");
        }
        requestAnimationFrame(() => this.update());
    }

    private keyboardController(event: KeyboardEvent) {
        if (event.type === "keydown") {
            this.keydown[event.code] = true;
            switch (event.code) {
                case "KeyQ":
                    this.menuController();
                    break;
                default:
                    break;
            }
        } else if (event.type === "keyup") {
            this.keydown[event.code] = false;
            // switch (event.code) {
            //     case "KeyQ":
            //         // this.menuController();
            //         break;
            //     default:
            //         break;
            // }
        }

    }
    private roleMove(id: string, dir: string) {
        switch (dir) {
            case "left":
                this.roles[id].realX -= this.roles[id].moveStep;
                break;
            case "right":
                this.roles[id].realX += this.roles[id].moveStep;
                break;
            case "up":
                this.roles[id].realY -= this.roles[id].moveStep;
                break;
            case "down":
                this.roles[id].realY += this.roles[id].moveStep;
                break;
            default:
                break;
        }
        this.hitEdge(this.roles[id]);
    }

    private dragBefore(event: any) {
        this.touched = true;
        this.pointerX = event.type === "mousedown" ? event.pageX : event.touches[0].pageX;
        this.pointerY = event.type === "mousedown" ? event.pageY : event.touches[0].pageY;
        for (const id in this.dragList) {
            if (this.dragList[id]) {
                const goods = this.dragList[id];
                if (goods.clickInMap(this.pointerX, this.pointerY)) {
                    this.dragingGoods = goods;
                    return;
                }
            }
        }
    }

    private dragGoodsBefore(event: any) {
        this.pointerX = event.type === "mousedown" ? event.pageX : event.touches[0].pageX;
        this.pointerY = event.type === "mousedown" ? event.pageY : event.touches[0].pageY;
        if (Menu.board.clickInMenu(this.pointerX, this.pointerY)) {
            Menu.goodsCanvas.canvas.style.display = "none";
            const board = new Goods.Board(
                (this.pointerX + Camera.x) / Camera.scale / Map.blockWidth,
                (this.pointerY + Camera.y) / Camera.scale / Map.blockHeight,
                1,
            );
            const shadow = new Goods.Board(
                +(board.realX / Map.blockWidth).toFixed(0),
                +(board.realY / Map.blockHeight).toFixed(0),
                0.4,
            );

            board.shadowId = shadow.uuid;
            shadow.addToContainer();
            board.addToContainer();

            this.dragList[board.uuid] = board;
            this.shadowList[shadow.uuid] = shadow;
            this.dragingGoods = board;
        }
    }

    private dragMove(event: any) {
        const x: number = event.type === "mousemove" ? event.pageX : event.touches[0].pageX;
        const y: number = event.type === "mousemove" ? event.pageY : event.touches[0].pageY;
        if (this.dragingGoods !== undefined) {
            this.dragingGoods.x += (x - this.pointerX);
            this.dragingGoods.y += (y - this.pointerY);

            const shadow = this.shadowList[this.dragingGoods.shadowId];
            const width = Map.blockWidth;
            const height = Map.blockHeight;

            const snx = +(this.dragingGoods.realX / width).toFixed(0) * width;
            const sny = +(this.dragingGoods.realY / height).toFixed(0) * height;

            shadow.x = snx * Camera.scale - Camera.x;
            shadow.y = sny * Camera.scale - Camera.y;

            this.hitEdge(this.dragingGoods);

            this.pointerX = x;
            this.pointerY = y;
        } else if (this.touched) {
            Camera.centerX -= (x - this.pointerX) / Camera.scale;
            Camera.centerY -= (y - this.pointerY) / Camera.scale;
            this.pointerX = x;
            this.pointerY = y;
        }
    }

    private dragEnd(event: any) {
        if (this.dragingGoods) {
            const width = Map.blockWidth;
            const height = Map.blockHeight;

            const snx = +(this.dragingGoods.realX / width).toFixed(0) * width;
            const sny = +(this.dragingGoods.realY / height).toFixed(0) * height;

            this.dragingGoods.x = snx * Camera.scale - Camera.x;
            this.dragingGoods.y = sny * Camera.scale - Camera.y;
        }
        Camera.checkRange();
        this.touched = false;
        this.dragingGoods = undefined;
    }

    private menuController() {
        if (Menu.goodsCanvas.canvas.style.display === "none") {
            Menu.goodsCanvas.canvas.style.zIndex = "2";
            Menu.goodsCanvas.canvas.style.display = "inline";
            Menu.render();
            this.addToGoods(Menu.board);
        } else {
            Menu.goodsCanvas.canvas.style.display = "none";
            Menu.goodsCanvas.canvas.style.zIndex = "0";
        }
    }

    private hitEdge(obj: {[key: string]: any | Role}) {
        if (obj.realX <= 0) {
            obj.realX = 0;
        }
        if (obj.realY <= 0) {
            obj.realY = 0;
        }
        if (obj.realX + obj.width >= Map.width) {
            obj.realX = Map.width - obj.width - 1;
        }
        if (obj.realY + obj.height >= Map.height) {
            obj.realY = Map.height - obj.height - 1;
        }
    }

    private addToGoods(goods: any) {
        this.goodsList[goods.id] = goods;
    }

    private zoom(event: MouseWheelEvent) {
        if (event.deltaY > 0) {
            Camera.zoom(-0.1);
        } else if (event.deltaY < 0) {
            Camera.zoom(0.1);
        }
        Camera.checkRange();
    }

}
