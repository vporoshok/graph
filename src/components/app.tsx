import { h, Component, ComponentChild } from 'preact';
import { GraphComponent } from './graph/graph';
import { Graph, Vertex, Edge, Change } from '../models/graph';
import * as style from './style.css';
import { DeepReadonly } from '../models/readonly';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require('preact/debug');
}

declare const window: {
    graph: Graph;
};

export interface AppState {
    vertices: DeepReadonly<Vertex[]>;
    edges: DeepReadonly<Edge[]>;
}

export class AppComponent extends Component<{}, AppState> {
    private graph = new Graph();
    private changeSub = this.graph.change$.subscribe(
        this.updateState.bind(this)
    );
    state = {
        vertices: this.graph.V,
        edges: this.graph.E
    };

    // eslint-disable-next-line react/no-deprecated
    componentWillMount(): void {
        window.graph = this.graph;
        const raw = localStorage.getItem('graph');
        if (raw !== null) {
            this.graph.deserialize(JSON.parse(raw));
        }
    }

    componentWillUnmount(): void {
        if (this.changeSub) {
            this.changeSub.unsubscribe();
        }
    }

    render(): ComponentChild {
        return (
            <div id="app" class={style.container}>
                <div class={style.graph}>
                    <GraphComponent
                        vertices={this.state.vertices}
                        edges={this.state.edges}
                        addVertex={this.graph.addVertex.bind(this.graph)}
                        moveVertex={this.graph.moveVertex.bind(this.graph)}
                        updateVertex={this.graph.updateVertex.bind(this.graph)}
                    />
                </div>
                <div class={style.editor}>
                    {/* <EditorComponent graph={this.gra} /> */}
                </div>
            </div>
        );
    }

    private updateState(_event: Change): void {
        this.setState(
            {
                vertices: this.graph.V,
                edges: this.graph.E
            },
            () =>
                localStorage.setItem(
                    'graph',
                    JSON.stringify(this.graph.serialize())
                )
        );
    }
}
