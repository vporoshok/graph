import { h, ComponentChild, RefObject, FunctionalComponent } from 'preact';
import * as style from './style.css';

export interface PopoverProps {
    target: RefObject<Element>;
    content: ComponentChild | ComponentChild[];
}

export const PopoverComponent: FunctionalComponent<PopoverProps> = props => {
    const bbox = props.target.current!.getBoundingClientRect();
    const position = {
        left: bbox.right,
        top: bbox.top + bbox.height / 2
    };
    return (
        <div class={style.container} style={position}>
            {props.content}
        </div>
    );
};
