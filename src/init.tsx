import { render } from "solid-js/web"
import { PageView } from "./pageview"
export const initPV = () => {
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const element = entry.target as HTMLElement
            const raw = element.innerText
            element.innerText = ''
            render(() => <PageView
                path={ element.attributes.getNamedItem('data-path')!.value }
                raw = { raw } />,
                element)
            observer.unobserve(element)
        }
    })
    for (const element of document.getElementsByClassName('meta-page-view') as HTMLCollectionOf<HTMLElement>) {
        observer.observe(element)
    }
}