export interface Point {
    x: number;
    y: number;
}

export interface Vertex extends Point {
    name: string;
}

export interface Graph {
    vertices: Array<Vertex>;
}
