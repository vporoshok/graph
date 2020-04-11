import { h, Component } from "preact";
import GraphComponent from './graph';
import { Graph } from '../models/graph';
import * as style from './style.css';
import { EditorComponent } from './editor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require("preact/debug");
}

export class AppComponent extends Component {
    graph: Graph = {
        vertices: [
            { x: 0, y: 0, name: 'test' },
        ],
    };

    render() {
        return (
            <div id="app" class={ style.container }>
                <div class={ style.graph }>
                    <GraphComponent
                        graph={ this.graph }
                    />
                </div>
                <div class={ style.editor }>
                    <EditorComponent
                        graph={ this.graph }
                    />
                </div>
            </div>
        );
    }
};
