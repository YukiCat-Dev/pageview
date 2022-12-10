import { css } from "@emotion/css"

export const styleClickable = css({
    cursor: "pointer"
})
export const popper = css({
    opacity: 0,
    background: "#33333380",
    color: "white",
    padding: "4px 8px",
    fontSize: "13px",
    borderRadius: "4px",
    maxHeight: "20vh",
    overflow: "auto",
    '&[data-show="true"]': {
        opacity: 1,
        backdropFilter: "blur(3px)",
    }, zIndex: 999
})
export const opacity_trans = css({
    transition: "opacity 500ms ease-in-out",
})