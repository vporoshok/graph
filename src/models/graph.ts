export interface Point {
    x: number;
    y: number;
}

export interface Vertex extends Point {
    color: string;
    name: string;
}

export interface Graph {
    vertices: Array<Vertex>;
}
