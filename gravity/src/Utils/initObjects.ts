import ObjectFactory, { IMakeableObject } from "../Objects/ObjectStore/ObjectFactory";
import ObjectStore from "../Objects/ObjectStore";
import { checkIfAnyAreaIsOccupiedByObject, getRandomCoordinates, randomColor, randomIntFromRange } from "./functions";
import { Area, Coordinates } from "../Shared/Interfaces";

function initObjects(): void {
    if (ObjectStore.storageCount >= 15) {
        return;
    }
    ObjectFactory.make({
        objectType: "Circle",
        x: 600,
        y: 600,
        dX: 8,
        dY: 8,
        mass: 1,
        color: randomColor(),
        radius: randomIntFromRange({ min: 30, max: 50 }),
    });

    ObjectFactory.make({
        objectType: "Circle",
        x: 770,
        y: 700,
        dX: -2,
        dY: 2,
        mass: 1,
        color: randomColor(),
        radius: randomIntFromRange({ min: 30, max: 50 }),
    });
}

function relocateObjectsOnScreen(): void {
    const objects: Array<IMakeableObject> = ObjectStore.getAllAsArray();

    const areasAlreadyOccupied: Array<Area> = [];
    const maxTries: number = 20000;

    objects.forEach(object => {
        let newCoordinates: Coordinates;
        let isOccupied = true;
        let count = 0;
        do {
            count++;
            newCoordinates = getRandomCoordinates(object.radius);
            Object.assign(object, newCoordinates);

            isOccupied = checkIfAnyAreaIsOccupiedByObject({ areas: areasAlreadyOccupied, object });
        } while (isOccupied && count < maxTries);

        areasAlreadyOccupied.push({ ...newCoordinates, radius: object.radius });
    });
}

function callNextFrame(
    c: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    objects: Array<IMakeableObject>,
    mouse: Coordinates
): void {
    c.fillStyle = "rgba(255, 255, 255, 0.2)";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillText("CANVAS", mouse.x, mouse.y);
    objects.forEach(object => {
        object.update();
    });
}

export { initObjects, relocateObjectsOnScreen, callNextFrame };
