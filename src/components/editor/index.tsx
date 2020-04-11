import { Graph } from '../../models/graph';
import { Component } from 'preact';
import * as style from './style.css';

export interface EditorProps {
    graph: Graph;
}

export class EditorComponent extends Component<EditorProps> {
    render(props: EditorProps) {
        return (
            <pre class={ style.editor }>
                { JSON.stringify(props.graph, undefined, 4) }
            </pre>
        );
    }
}
