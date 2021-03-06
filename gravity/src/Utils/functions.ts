import { ICircle } from "../Objects/CanvasObjects/Circle";
import { colors } from "./constants";
import { Area, Position } from "../Shared/Interfaces";
import { IMakeableObject } from "../Objects/ObjectStore/ObjectFactory";

interface IRandomIntFromRange {
    min: number;
    max: number;
}
function randomIntFromRange({ min, max }: IRandomIntFromRange) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

interface IDistance {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
function calcDistance({ x1, y1, x2, y2 }: IDistance) {
    const xDist = x2 - x1;
    const yDist = y2 - y1;

    return Math.hypot(xDist, yDist);
}

interface ICheckIfCoordinatesAreInArea {
    x: number;
    y: number;
    coordinateRadius?: number;
    areaX: number;
    areaY: number;
    areaRadius?: number;
}

function checkIfCoordinatesAreInArea({
    x,
    y,
    coordinateRadius,
    areaX,
    areaY,
    areaRadius,
}: ICheckIfCoordinatesAreInArea): boolean {
    const _coordinateRadius = coordinateRadius ? coordinateRadius : 0;
    const _areaRadius = areaRadius ? areaRadius : 0;

    const objectMinX = x - _coordinateRadius;
    const objectMaxX = x + _coordinateRadius;
    const objectMinY = y - _coordinateRadius;
    const objectMaxY = y + _coordinateRadius;

    const areaMinX = areaX - _areaRadius;
    const areaMaxX = areaX + _areaRadius;
    const areaMinY = areaY - _areaRadius;
    const areaMaxY = areaY + _areaRadius;

    const isNotInAreaX = areaMinX > objectMaxX || areaMaxX < objectMinX;
    const isNotInAreaY = areaMinY > objectMaxY || areaMaxY < objectMinY;

    const isNotInArea = isNotInAreaX || isNotInAreaY;

    return !isNotInArea;
}

function getRandomPosition(coordinateRadius: number = 0): Position {
    const x = randomIntFromRange({ min: 0 + coordinateRadius, max: innerWidth - coordinateRadius });
    const y = randomIntFromRange({ min: 0 + coordinateRadius, max: innerHeight - coordinateRadius });
    return { x, y };
}

interface ICheckIfAnyAreaIsOccupiedByObject {
    areas: Array<Area>;
    object: ICircle;
}
function checkIfAnyAreaIsOccupiedByObject({ areas, object }: ICheckIfAnyAreaIsOccupiedByObject) {
    const isAnyAreaOccupied = areas.some(area => {
        return checkIfCoordinatesAreInArea({
            x: object.position.x,
            y: object.position.y,
            coordinateRadius: object.radius,
            areaRadius: area.radius,
            areaX: area.x,
            areaY: area.y,
        });
    });

    return isAnyAreaOccupied;
}

function randomColor(exceptionColorValue: string | null = null): any {
    const size = Object.keys(colors).length;
    const randomColorIndex = Math.floor(Math.random() * size);

    let counter = 0;
    for (let color in colors) {
        if (counter === randomColorIndex) {
            if (colors[color] !== exceptionColorValue) {
                return colors[color];
            }
            return randomColor(exceptionColorValue);
        }
        counter++;
    }
}

const debounce = (func: any, wait: any) => {
    let timeout: any;

    return function executedFunction(...args: any) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

function rotate({ dX, dY }: any, angle: number) {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    const rotatedVelocities = {
        dX: dX * cosAngle - dY * sinAngle,
        dY: dX * sinAngle + dY * cosAngle,
    };

    return rotatedVelocities;
}

function resolveCollision(particle: IMakeableObject, otherParticle: IMakeableObject) {
    const xVelocityDiff = particle.velocity.dX - otherParticle.velocity.dX;
    const yVelocityDiff = particle.velocity.dY - otherParticle.velocity.dY;

    const xDist = otherParticle.position.x - particle.position.x;
    const yDist = otherParticle.position.y - particle.position.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        // Grab angle between the two colliding particles
        const angle = -Math.atan2(
            otherParticle.position.y - particle.position.y,
            otherParticle.position.x - particle.position.x
        );

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate({ dX: particle.velocity.dX, dY: particle.velocity.dY }, angle);
        const u2 = rotate({ dX: otherParticle.velocity.dX, dY: otherParticle.velocity.dY }, angle);

        // Velocity after 1d collision equation
        const v1 = { dX: (u1.dX * (m1 - m2)) / (m1 + m2) + (u2.dX * 2 * m2) / (m1 + m2), dY: u1.dY };
        const v2 = { dX: (u2.dX * (m1 - m2)) / (m1 + m2) + (u1.dX * 2 * m2) / (m1 + m2), dY: u2.dY };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.dX = vFinal1.dX;
        particle.velocity.dY = vFinal1.dY;

        otherParticle.velocity.dX = vFinal2.dX;
        otherParticle.velocity.dY = vFinal2.dY;
    }
}

export {
    randomIntFromRange,
    randomColor,
    calcDistance,
    checkIfCoordinatesAreInArea,
    getRandomPosition,
    checkIfAnyAreaIsOccupiedByObject,
    debounce,
    rotate,
    resolveCollision,
};
