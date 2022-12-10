import { JSX } from "solid-js/jsx-runtime";
import { PVDate } from "./data";
export interface DetailPannelProp {
    data: PVDate;
    style?: JSX.CSSProperties;
    show: boolean;
    onTransitionEnd: () => void;
    ref?: HTMLDivElement;
}
export declare function DetailPannel(props: DetailPannelProp): JSX.Element;
