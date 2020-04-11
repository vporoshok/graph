import { Component } from 'preact';
import { Graph } from '../../models/graph';
import * as style from './style.css';

export interface GraphProps {
    graph: Graph;
}

export interface GraphState {
    translate: { dx: number, dy: number };
}

class GraphComponent extends Component<GraphProps, GraphState> {
    render(props, { translate = { dx: 40, dy: 40 }}) {
        const transform = `translate(${ translate.dx } ${ translate.dy })`;
        return (
            <svg class={ style.svg }>
                <g transform={ transform }>
                    { props.graph.vertices.map(v => (
                        <circle cx={ v.x } cy={ v.y } r="5" />
                    )) }
                </g>
            </svg>
        );
    }
}

export default GraphComponent;
