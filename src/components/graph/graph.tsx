import { h, Component, createRef, ComponentChild } from 'preact';
import { Vertex, Point, Edge } from '../../models/graph';
import * as style from './style.css';
import { PopoverComponent } from '../popover';
import { VertexSettingsComponent } from '../vertex-settings';
import { DeepReadonly } from '../../models/readonly';

export interface GraphProps {
    vertices: DeepReadonly<Vertex[]>;
    edges: DeepReadonly<Edge[]>;
    addVertex: (v: Point) => void;
    moveVertex: (v: Pick<Vertex, 'id' | 'x' | 'y'>) => void;
    updateVertex: (v: Omit<Vertex, 'x' | 'y'>) => void;
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
    movedVertexStartPoint?: Point;
    movedVertexTranslate?: Translate;

    menuedVertexIndex?: number;
}

export class GraphComponent extends Component<GraphProps, GraphState> {
    state: Readonly<GraphState> = { translate: { dx: 0, dy: 0 } };
    private ref = createRef();
    private menuedVertex = createRef();

    private get vertexMenu(): ComponentChild {
        return (
            <VertexSettingsComponent
                vertex={this.props.vertices[this.state.menuedVertexIndex!]}
                onChange={this.props.updateVertex}
                onClose={() => this.setState({ menuedVertexIndex: undefined })}
            />
        );
    }

    render(props: GraphProps, state: Readonly<GraphState>) {
        const transform = `translate(${state.translate.dx} ${state.translate.dy})`;
        return (
            <div class={style.container}>
                <svg
                    ref={this.ref}
                    class={style.svg}
                    tab-index="-1"
                    onDblClick={e => this.createVertex(e)}
                    onMouseDown={e => this.onMouseDown(e)}
                    onMouseMove={e => this.onMouseMove(e)}
                    onMouseUp={() => this.onMouseUp()}
                >
                    <g transform={transform}>
                        {props.edges.map(e => (
                            <line
                                key={e.source.id + e.target.id}
                                x1={e.source.x}
                                y1={e.source.y}
                                x2={e.target.x}
                                y2={e.target.y}
                                stroke={e.color}
                            />
                        ))}
                        {props.vertices.map((v, i) => (
                            <g
                                key={v.id}
                                transform={this.vertexTranslate(i, v)}
                            >
                                <circle
                                    ref={
                                        i === state.menuedVertexIndex
                                            ? this.menuedVertex
                                            : undefined
                                    }
                                    r="5"
                                    fill={v.color}
                                    onMouseDown={e =>
                                        this.onVertexMoveStart(i, e)
                                    }
                                    onContextMenu={e =>
                                        this.onRightClickOnVertex(i, e)
                                    }
                                />
                                <text x="5" y="15">
                                    {v.name}
                                </text>
                            </g>
                        ))}
                    </g>
                </svg>
                {state.menuedVertexIndex !== undefined && this.menuedVertex ? (
                    <PopoverComponent
                        target={this.menuedVertex}
                        content={this.vertexMenu}
                    ></PopoverComponent>
                ) : null}
            </div>
        );
    }

    private vertexTranslate(i: number, v: Vertex): string {
        let x = v.x;
        let y = v.y;
        if (this.state.movedVertexIndex === i) {
            x += this.state.movedVertexTranslate!.dx;
            y += this.state.movedVertexTranslate!.dy;
        }
        return `translate(${x}, ${y})`;
    }

    private createVertex(event: MouseEvent): void {
        const svg = this.ref.current as SVGElement;
        const rect = svg.getBoundingClientRect();
        const point = {
            x: event.clientX - rect.x - this.state.translate.dx,
            y: event.clientY - rect.y - this.state.translate.dy
        };
        this.props.addVertex({
            ...point
        });
    }

    private onMouseDown(event: MouseEvent): void {
        this.setState({
            translateStartPoint: { x: event.clientX, y: event.clientY },
            translateStartValue: this.state.translate,
            menuedVertexIndex: undefined
        });
    }

    private onMouseMove(event: MouseEvent): void {
        if (this.state.translateStartPoint && this.state.translateStartValue) {
            this.setState({
                translate: {
                    dx:
                        this.state.translateStartValue.dx +
                        event.clientX -
                        this.state.translateStartPoint.x,
                    dy:
                        this.state.translateStartValue.dy +
                        event.clientY -
                        this.state.translateStartPoint.y
                }
            });
        }
        if (this.state.movedVertexStartPoint) {
            this.setState({
                movedVertexTranslate: {
                    dx: event.clientX - this.state.movedVertexStartPoint!.x,
                    dy: event.clientY - this.state.movedVertexStartPoint!.y
                }
            });
        }
    }

    private onMouseUp(): void {
        if (
            this.state.movedVertexIndex !== undefined &&
            this.state.movedVertexTranslate
        ) {
            this.props.moveVertex({
                id: this.props.vertices[this.state.movedVertexIndex].id,
                x:
                    this.props.vertices[this.state.movedVertexIndex].x +
                    this.state.movedVertexTranslate.dx,
                y:
                    this.props.vertices[this.state.movedVertexIndex].y +
                    this.state.movedVertexTranslate.dy
            });
        }
        this.setState({
            translateStartPoint: undefined,
            translateStartValue: undefined,

            movedVertexIndex: undefined,
            movedVertexStartPoint: undefined,
            movedVertexTranslate: undefined
        });
    }

    private onVertexMoveStart(i: number, event: MouseEvent): void {
        event.stopPropagation();
        this.setState({
            movedVertexIndex: i,
            movedVertexStartPoint: { x: event.clientX, y: event.clientY },
            movedVertexTranslate: { dx: 0, dy: 0 }
        });
    }

    private onRightClickOnVertex(i: number, event: MouseEvent): boolean {
        event.stopPropagation();
        event.preventDefault();
        this.setState({
            menuedVertexIndex: i
        });
        return false;
    }
}
