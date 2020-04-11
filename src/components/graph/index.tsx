import { Component, createRef } from 'preact';
import { Graph, Vertex, Point } from '../../models/graph';
import * as style from './style.css';

export interface GraphProps {
    graph: Graph;
    onAddVertex: (v: Vertex) => void;
    onMoveVertex: (i: number, p: Point) => void;
}

export interface Translate {
    dx: number;
    dy: number;
}

export interface GraphState {
    translate: Translate;

    translateStartPoint?: Point;
    translateStartValue?: Translate;

    movedVertexIndex?: number;
    movedVertexStartPoint: Point;
    movedVertexTranslate: Translate;
}

class GraphComponent extends Component<GraphProps, GraphState> {
    state = { translate: { dx: 0, dy: 0 }}
    private ref = createRef();

    onDblClick(event: MouseEvent): void {
        const svg = this.ref.current as SVGElement;
        const rect = svg.getBoundingClientRect();
        const point = {
            x: event.clientX - rect.x - this.state.translate.dx,
            y: event.clientY - rect.y - this.state.translate.dy,
        };
        this.props.onAddVertex({ ...point });
    }

    onMouseDown(event: MouseEvent): void {
        this.setState({
            translateStartPoint: { x: event.clientX, y: event.clientY },
            translateStartValue: this.state.translate,
        });
    }

    onMouseMove(event: MouseEvent): void {
        if (this.state.translateStartPoint && this.state.translateStartValue) {
            this.setState({ translate: {
                dx: this.state.translateStartValue.dx + event.clientX - this.state.translateStartPoint.x,
                dy: this.state.translateStartValue.dy + event.clientY - this.state.translateStartPoint.y,
            } });
        }
        if (this.state.movedVertexStartPoint) {
            this.setState({
                movedVertexTranslate: {
                    dx: event.clientX - this.state.movedVertexStartPoint!.x,
                    dy: event.clientY - this.state.movedVertexStartPoint!.y,
                }
            });
        }
    }

    onMouseUp(): void {
        if (this.state.movedVertexIndex !== undefined) {
            this.props.onMoveVertex(this.state.movedVertexIndex, {
                x: this.props.graph.vertices[this.state.movedVertexIndex].x + this.state.movedVertexTranslate.dx,
                y: this.props.graph.vertices[this.state.movedVertexIndex].y + this.state.movedVertexTranslate.dy,
            })
        }
        this.setState({
            translateStartPoint: undefined,
            translateStartValue: undefined,

            movedVertexIndex: undefined,
            movedVertexStartPoint: undefined,
            movedVertexTranslate: undefined,
        });
    }

    onVertexMoveStart(i: number, event: MouseEvent): void {
        event.stopPropagation();
        this.setState({
            movedVertexIndex: i,
            movedVertexStartPoint: { x: event.clientX, y: event.clientY },
            movedVertexTranslate: { dx: 0, dy: 0 },
        });
    }

    render(props, state: Readonly<GraphState>) {
        const transform = `translate(${ state.translate.dx } ${ state.translate.dy })`;
        return (
            <svg
                ref={ this.ref }
                class={ style.svg }
                onDblClick={ e => this.onDblClick(e) }
                onMouseDown={ e => this.onMouseDown(e) }
                onMouseMove={ e => this.onMouseMove(e) }
                onMouseUp={ () => this.onMouseUp() }
            >
                <g transform={ transform }>
                    { props.graph.vertices.map((v, i) => (
                        <circle
                            cx={ v.x + (state.movedVertexIndex === i ? state.movedVertexTranslate.dx : 0) }
                            cy={ v.y + (state.movedVertexIndex === i ? state.movedVertexTranslate.dy : 0) }
                            r="5"
                            onMouseDown={ e => this.onVertexMoveStart(i, e) }
                        />
                    )) }
                </g>
            </svg>
        );
    }
}

export default GraphComponent;
