import { JSX } from "solid-js/jsx-runtime"
import { PVDate } from "./data"
import { popper, opacity_trans } from "./style"
import { splitProps } from "solid-js"

export interface DetailPannelProp {
    data: PVDate
    style?: JSX.CSSProperties
    show: boolean
    onTransitionEnd: () => void
    ref?: HTMLDivElement
}
export function DetailPannel(props: DetailPannelProp) {
    const [{ data }, rest] = splitProps(props, ['data'])
    let content: JSX.Element
    if (data.avgTOP) {
        const avgTop = parseFloat(data.avgTOP)
        content = <>
            <li>
                {`平均浏览时间:${toTime(avgTop)}`}
            </li>
            <li>
                {`总浏览时间:${toTime(avgTop * parseInt(data.hit), 0)}`}
            </li>
        </>
    }
    return <div class={popper + ' ' + opacity_trans}
        {...rest}>
        <li>
            {`浏览量:${data.hit}`}
        </li>
        {content}
    </div>
}


const toTime = (time: string | number, secFix: number = 2) => {
    const _hour = (typeof time == 'string' ? parseFloat(time) : time) / 3600//second
    const hour = _hour | 0
    const _min = (_hour - hour) * 60
    const min = _min | 0
    const second = (_min - min) * 60
    const ms = second - (second | 0)
    return `${hour > 0 ? `${hour}小时` : ''}${min > 0 ? `${min}分` : ''}${second > 0 ? `${ms > 0 ? second.toFixed(secFix) : second}秒` : ''}`
}