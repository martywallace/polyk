export interface RaycastResult {
    dist: number,
    edge: number,
    norm: {
        x: number,
        y: number
    },
    refl: {
        x: number,
        y: number
    }
}

export interface ClosestEdgeResult {
    dist: number,
    edge: number,
    point: {
        x: number,
        y: number
    },
    norm: {
        x: number,
        y: number
    }
}

export interface AABB {
    x: number
    y: number
    width: number
    height: number
}

export type Polygon = number[]
export function IsSimple(polygon: Polygon): boolean
export function Slice(polygon: Polygon, startX: number, startY: number, endX: number, endY: number): Polygon[]
export function IsConvex(polygon: Polygon): boolean
export function GetArea(polygon: Polygon): number
export function GetAABB(polygon: Polygon): AABB
export function Triangulate(polygon: Polygon): Polygon
export function ContainsPoint(polygon: Polygon, pointX: number, pointY: number): boolean
export function Raycast(polygon: Polygon, originX: number, originY: number, directionX: number, directionY: number): RaycastResult
export function ClosestEdge(polygon: Polygon, x: number, y: number): RaycastResult