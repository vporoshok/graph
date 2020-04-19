import { DeepReadonly } from './readonly';
import { Subject, Observable } from 'rxjs';

export interface Point {
    x: number;
    y: number;
}

interface VertexData extends Point {
    id: number;
    color: string;
    name: string;
}

export interface Vertex extends VertexData {
    id: number;
}

interface EdgeData {
    color: string;
    cost: number;
    directed: boolean;
}

interface EdgeJSON extends EdgeData {
    source: number;
    target: number;
}

export interface GraphJSON {
    vertices: Vertex[];
    edges: EdgeJSON[];
}

interface EdgeRuntime {
    data: EdgeData;
    target: VertexRuntime;
}

interface VertexRuntime {
    data: VertexData;
    edges: Map<number, EdgeRuntime>;
}

export interface Edge extends EdgeData {
    source: Vertex;
    target: Vertex;
}

export enum ChangeKind {
    Deserialized,
    VertexAdded,
    VertexMoved,
    VertexUpdated,
    EdgeAdded
}

export interface Deserialized {
    kind: ChangeKind.Deserialized;
}

export interface VertexAdded {
    kind: ChangeKind.VertexAdded;
    v: Vertex;
}

export interface VertexMoved {
    kind: ChangeKind.VertexMoved;
    v: Vertex;
}

export interface VertexUpdated {
    kind: ChangeKind.VertexUpdated;
    v: Vertex;
}

export interface EdgeAdded {
    kind: ChangeKind.EdgeAdded;
    e: Edge;
}

export type Change =
    | Deserialized
    | VertexAdded
    | VertexMoved
    | VertexUpdated
    | EdgeAdded;

export class Graph {
    private serial = 0;
    private _change$ = new Subject<Change>();
    private vertices = new Map<number, VertexRuntime>();

    get V(): DeepReadonly<Vertex[]> {
        const res = new Array<Vertex>();
        for (const v of this.vertices.values()) {
            res.push(v.data);
        }
        return res;
    }

    get E(): DeepReadonly<Edge[]> {
        const res = new Array<Edge>();
        for (let i = 0; i < this.serial; i++) {
            const v = this.vertices.get(i);
            if (v === undefined) {
                continue;
            }
            for (const e of v.edges.values()) {
                if (e.data.directed || e.target.data.id > v.data.id) {
                    res.push({
                        ...e.data,
                        source: v.data,
                        target: e.target.data
                    });
                }
            }
        }
        return res;
    }

    get change$(): Observable<Change> {
        return this._change$.asObservable();
    }

    addVertex(data: Point & Partial<VertexData>): Vertex {
        const id = ++this.serial;
        const v = {
            data: { name: id.toString(), color: '#000000', ...data, id },
            edges: new Map()
        };
        this.vertices.set(id, v);
        this._change$.next({ kind: ChangeKind.VertexAdded, v: v.data });
        return v.data;
    }

    moveVertex(data: Pick<Vertex, 'id' | 'x' | 'y'>): Vertex {
        const v = this.vertices.get(data.id);
        if (v === undefined) {
            throw new ReferenceError(`unknown vertex ${data.id}`);
        }
        v.data = { ...v.data, x: data.x, y: data.y };
        this._change$.next({ kind: ChangeKind.VertexMoved, v: v.data });
        return v.data;
    }

    updateVertex(data: Omit<Vertex, 'x' | 'y'>): Vertex {
        const v = this.vertices.get(data.id);
        if (v === undefined) {
            throw new ReferenceError(`unknown vertex ${data.id}`);
        }
        v.data = { ...data, x: v.data.x, y: v.data.y };
        this._change$.next({ kind: ChangeKind.VertexUpdated, v: v.data });
        return v.data;
    }

    addEdge(e: EdgeData & { source: number; target: number }): Edge {
        const res = this._addEdge(e);
        this._change$.next({ kind: ChangeKind.EdgeAdded, e: res });
        return res;
    }

    serialize(): DeepReadonly<GraphJSON> {
        return {
            vertices: this.V,
            edges: this.E.map(e => ({
                ...e,
                source: e.source.id,
                target: e.target.id
            }))
        };
    }

    deserialize(graph: DeepReadonly<GraphJSON>): void {
        this.serial = graph.vertices.reduce((acc, v) => Math.max(acc, v.id), 0);
        for (const v of graph.vertices) {
            this.vertices.set(v.id, { data: v, edges: new Map() });
        }
        for (const e of graph.edges) {
            this._addEdge(e);
        }
        this._change$.next({ kind: ChangeKind.Deserialized });
    }

    private _addEdge(e: EdgeJSON): Edge {
        const { source: sId, target: tId, ...data } = e;
        const source = this.vertices.get(sId);
        const target = this.vertices.get(tId);
        if (!source || !target) {
            throw new ReferenceError(`invalid edge from ${sId} to ${tId}`);
        }
        source.edges.set(tId, { data, target });
        if (!e.directed) {
            target.edges.set(sId, { data, target: source });
        }
        return { ...data, source: source.data, target: target.data };
    }
}
