import { h, FunctionalComponent } from 'preact';
import { Vertex } from '../../models/graph';

export interface VertexSettingsProps {
    vertex: Vertex;
    onChange: (_: Vertex) => void;
    onClose: () => void;
}

export const VertexSettingsComponent: FunctionalComponent<VertexSettingsProps> = props => {
    let name = props.vertex.name;
    let color = props.vertex.color;

    function save(e: Event) {
        e.preventDefault();
        if (props.vertex.name !== name || props.vertex.color !== color) {
            props.onChange({ ...props.vertex, color, name });
        }
        props.onClose();
    }

    return (
        <form onSubmit={save}>
            <input
                type="color"
                value={color}
                onChange={e => (color = e.currentTarget.value)}
            />
            <input
                type="text"
                ref={dom => dom && dom.select()}
                value={name}
                onChange={e => (name = e.currentTarget.value)}
            />
            <button>Save</button>
        </form>
    );
};
