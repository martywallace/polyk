declare var PolyK: {
    Slice(p: number[], ax: number, ay: number, bx: number, by: number): number[],
    IsSimple(p: number[]): boolean,
    IsConvex(p: number[]): boolean,
    GetArea(p: number[]): number,
    GetAABB(p: number[]): {},
    Triangulate(p: number[]): number[],
    ContainsPoint(p: number[], ax: number, ay: number): boolean,
    Raycast(p: number[],x : number, y: number, dx: number, dy: number): RaycastResult,
    ClosestEdge(p: number[], x: number, y: number): RaycastResult
}

interface RaycastResult {
    dist:number,
    edge:number,
    norm: {
        x:number,
        y:number
    },
    refl: {
        x:number,
        y:number
    }
}

export = PolyK
