import { h, Component } from "preact";
import GraphComponent from './graph';
import { Graph, Vertex, Point } from '../models/graph';
import * as style from './style.css';
import { EditorComponent } from './editor';
import { assocPath, update, evolve, adjust } from 'ramda';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require("preact/debug");
}

export interface AppProps {}

export interface AppState {
    graph: Graph;
}

export class AppComponent extends Component<{}, AppState> {
    state: Readonly<AppState> = { graph: { vertices: [ { x: 10, y: 10 } ] } };

    onAddVertex(v: Vertex) {
        this.setState({ graph: { ...this.state.graph, vertices: [...this.state.graph.vertices, v] } });
    }

    onMoveVertex(i: number, p: Point) {
        this.setState(evolve({
            graph: {
                vertices: adjust(i, v => ({ ...v, ...p }))
            },
        }, this.state));
    }

    render(props: AppProps, state: Readonly<AppState>) {
        return (
            <div id="app" class={ style.container }>
                <div class={ style.graph }>
                    <GraphComponent
                        graph={ state.graph }
                        onAddVertex={ v => this.onAddVertex(v) }
                        onMoveVertex={ (i, p) => this.onMoveVertex(i, p) }
                    />
                </div>
                <div class={ style.editor }>
                    <EditorComponent
                        graph={ state.graph }
                    />
                </div>
            </div>
        );
    }
};
