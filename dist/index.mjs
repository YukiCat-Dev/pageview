import { insert, className, spread, template, delegateEvents, setAttribute, memo, createComponent, Portal, use, render } from 'solid-js/web';
import { splitProps, createResource, createSignal, onCleanup, batch } from 'solid-js';
import { css } from '@emotion/css';
import { autoUpdate, computePosition, shift, flip } from '@floating-ui/dom';

const styleClickable = css({
  cursor: "pointer"
});
const popper = css({
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
    backdropFilter: "blur(3px)"
  },
  zIndex: 999
});
const opacity_trans = css({
  transition: "opacity 500ms ease-in-out"
});

const _tmpl$$1 = /*#__PURE__*/template(`<li>`),
  _tmpl$2 = /*#__PURE__*/template(`<div><li>`);
function DetailPannel(props) {
  const [{
    data
  }, rest] = splitProps(props, ['data']);
  let content;
  if (data.avgTOP) {
    const avgTop = parseFloat(data.avgTOP);
    content = [(() => {
      const _el$ = _tmpl$$1();
      insert(_el$, () => `平均浏览时间:${toTime(avgTop)}`);
      return _el$;
    })(), (() => {
      const _el$2 = _tmpl$$1();
      insert(_el$2, () => `总浏览时间:${toTime(avgTop * parseInt(data.hit), 0)}`);
      return _el$2;
    })()];
  }
  return (() => {
    const _el$3 = _tmpl$2(),
      _el$4 = _el$3.firstChild;
    className(_el$3, popper + ' ' + opacity_trans);
    spread(_el$3, rest, false, true);
    insert(_el$4, () => `浏览量:${data.hit}`);
    insert(_el$3, content, null);
    return _el$3;
  })();
}
const toTime = (time, secFix = 2) => {
  const _hour = (typeof time == 'string' ? parseFloat(time) : time) / 3600; //second
  const hour = _hour | 0;
  const _min = (_hour - hour) * 60;
  const min = _min | 0;
  const second = (_min - min) * 60;
  const ms = second - (second | 0);
  return `${hour > 0 ? `${hour}小时` : ''}${min > 0 ? `${min}分` : ''}${second > 0 ? `${ms > 0 ? second.toFixed(secFix) : second}秒` : ''}`;
};

const _tmpl$ = /*#__PURE__*/template(`<span>`);
const API_PREFIX = 'https://yukicat-ga-hit.vercel.app/api/ga/?page=';
function PageView({
  path: path_raw,
  raw
}) {
  const path = path_raw + (path_raw.endsWith('/') ? '' : '/');
  const [data] = createResource(path, path => fetch(API_PREFIX + path).then(r => r.json()));
  const error = data.error;
  const _rawHit = raw.replace(/<\/?span>/g, '');
  const [showPannel, setShowPannel] = createSignal(false);
  const [mountPannel, setMountPannel] = createSignal(false);
  const [ticker, setTicker] = createSignal();
  const [popperStyle, setPopperStyles] = createSignal({
    position: 'absolute',
    left: 0,
    top: 0,
    width: 'max-content'
  });
  let refEle;
  let refPopper;
  const updatePosition = async () => {
    const position = await computePosition(refEle, refPopper, {
      placement: 'top',
      middleware: [shift(), flip()]
    });
    setPopperStyles(prevStyle => {
      return {
        ...prevStyle,
        left: `${position.x}px`,
        top: `${position.y}px`
      };
    });
  };
  let cleanupAutoUpdate;
  onCleanup(() => {
    clearTimeout(ticker());
    cleanupAutoUpdate?.();
  }); //cleaner
  return (() => {
    const _el$ = _tmpl$();
    const _ref$ = refEle;
    typeof _ref$ === "function" ? use(_ref$, _el$) : refEle = _el$;
    _el$.$$click = () => {
      if (ticker()) {
        clearTimeout(ticker());
        setTicker(undefined);
      }
      const nextShowPannel = setShowPannel(prev => !prev);
      if (nextShowPannel) {
        batch(() => {
          setMountPannel(true);
          setTicker(setTimeout(() => {
            batch(() => {
              setShowPannel(false);
              setTicker(undefined);
            });
          }, 5000));
        });
        updatePosition();
        cleanupAutoUpdate = autoUpdate(refEle, refPopper, updatePosition);
      }
    };
    setAttribute(_el$, "data-raw", raw);
    className(_el$, styleClickable);
    insert(_el$, () => error ? _rawHit.replace(/\d{1,}/, '-') : data() ? _rawHit.replace(/\d{1,}/, data()[0].hit) : _rawHit, null);
    insert(_el$, (() => {
      const _c$ = memo(() => !!mountPannel());
      return () => _c$() && createComponent(Portal, {
        get children() {
          return createComponent(DetailPannel, {
            ref(r$) {
              const _ref$2 = refPopper;
              typeof _ref$2 === "function" ? _ref$2(r$) : refPopper = r$;
            },
            get data() {
              return data()?.[0] ?? {
                hit: _rawHit
              };
            },
            get style() {
              return popperStyle();
            },
            get show() {
              return showPannel();
            },
            onTransitionEnd: () => {
              cleanupAutoUpdate?.();
              cleanupAutoUpdate = undefined;
              setMountPannel(false);
            }
          });
        }
      });
    })(), null);
    return _el$;
  })();
}
delegateEvents(["click"]);

const initPV = () => {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      const raw = element.innerText;
      element.innerText = '';
      render(() => createComponent(PageView, {
        get path() {
          return element.attributes.getNamedItem('data-path').value;
        },
        raw: raw
      }), element);
      observer.unobserve(element);
    }
  });
  for (const element of document.getElementsByClassName('meta-page-view')) {
    observer.observe(element);
  }
};

export { initPV };
//# sourceMappingURL=index.mjs.map
