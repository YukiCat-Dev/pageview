import { batch, createResource, createSignal, JSX, onCleanup, } from "solid-js"
import { Portal } from "solid-js/web";
import { PVDate } from "./data";
import { DetailPannel } from "./DetailPannel";
import { styleClickable } from "./style";
import { autoUpdate, computePosition, flip, shift } from '@floating-ui/dom'

const API_PREFIX = 'https://yukicat-ga-hit.vercel.app/api/ga/?page='

export function PageView({ path: path_raw, raw }: { path: string, raw: string }) {
    const path = path_raw + (path_raw.endsWith('/') ? '' : '/')
    const [data] = createResource(path, (path) => fetch(API_PREFIX + path).then(r => r.json() as Promise<PVDate[]>))
    const error = data.error
    const _rawHit = raw.replace(/<\/?span>/g, '')
    const [showPannel, setShowPannel] = createSignal(false)
    const [mountPannel, setMountPannel] = createSignal(false)
    const [ticker, setTicker] = createSignal<number>()
    const [popperStyle, setPopperStyles] = createSignal<JSX.CSSProperties>({ position: 'absolute', left: 0, top: 0, width: 'max-content' })
    let refEle: HTMLSpanElement | undefined
    let refPopper: HTMLDivElement | undefined

    const updatePosition = async () => {
        const position = await computePosition(
            refEle!,
            refPopper!,
            {
                placement: 'top',
                middleware: [shift(), flip()]
            }
        )
        setPopperStyles((prevStyle) => {
            return {
                ...prevStyle,
                left: `${position.x}px`,
                top: `${position.y}px`,
            }
        })
    }
    let cleanupAutoUpdate: (() => void) | undefined

    onCleanup(() => {
        clearTimeout(ticker())
        cleanupAutoUpdate?.()
    })        //cleaner
    return <>
        <span onClick={() => {
            if (ticker()) {
                clearTimeout(ticker())
                setTicker(undefined)
            }
            const nextShowPannel = setShowPannel(prev => !prev)

            if (nextShowPannel) {
                batch(() => {
                    setMountPannel(true)
                    setTicker(
                        setTimeout(() => {
                            batch(() => {
                                setShowPannel(false)
                                setTicker(undefined)
                            })
                        }, 5000)
                    )
                })
                updatePosition()
                cleanupAutoUpdate = autoUpdate(refEle!, refPopper!, updatePosition)
            }
        }}
            ref={refEle}
            data-raw={raw}
            class={styleClickable}>
            {error ? _rawHit.replace(/\d{1,}/, '-') : (data() ? _rawHit.replace(/\d{1,}/, data()![0].hit) : _rawHit)}
            {mountPannel() && <Portal>
                <DetailPannel ref={refPopper}
                    data={(data()?.[0]) ?? { hit: _rawHit }}
                    style={popperStyle()}
                    show={showPannel()}
                    onTransitionEnd={() => {
                        cleanupAutoUpdate?.()
                        cleanupAutoUpdate = undefined
                        setMountPannel(false)
                    }} />
            </Portal>}
        </span>
    </>
}

