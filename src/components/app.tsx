import { h, Component, ComponentChild } from 'preact';
import { GraphComponent } from './graph';
import { Graph, Vertex } from '../models/graph';
import * as style from './style.css';
import { EditorComponent } from './editor';
import { evolve, append, update } from 'ramda';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require('preact/debug');
}

export interface AppState {
    graph: Graph;
}

export class AppComponent extends Component<{}, AppState> {
    state: Readonly<AppState>;

    constructor() {
        super();
        const state = localStorage.getItem('graph');
        if (state) {
            this.state = JSON.parse(state);
        } else {
            this.state = { graph: { vertices: [] } };
        }
    }

    setState(state: Partial<AppState>): void {
        super.setState(state, () =>
            localStorage.setItem('graph', JSON.stringify(this.state))
        );
    }

    private onAddVertex(v: Vertex): void {
        this.setState(
            evolve(
                {
                    graph: {
                        vertices: append(v) as (_: Vertex[]) => Vertex[]
                    }
                },
                this.state
            )
        );
    }

    private onChangeVertex(i: number, v: Vertex): void {
        this.setState(
            evolve(
                {
                    graph: {
                        vertices: update(i, v)
                    }
                },
                this.state
            )
        );
    }

    render(_props: {}, state: Readonly<AppState>): ComponentChild {
        return (
            <div id="app" class={style.container}>
                <div class={style.graph}>
                    <GraphComponent
                        graph={state.graph}
                        onAddVertex={this.onAddVertex.bind(this)}
                        onChangeVertex={this.onChangeVertex.bind(this)}
                    />
                </div>
                <div class={style.editor}>
                    <EditorComponent graph={state.graph} />
                </div>
            </div>
        );
    }
}
