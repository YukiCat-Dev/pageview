'use strict';

Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });

const web = require('solid-js/web');
const solidJs = require('solid-js');
const css = require('@emotion/css');
const dom = require('@floating-ui/dom');

const styleClickable = css.css({
  cursor: "pointer"
});
const popper = css.css({
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
const opacity_trans = css.css({
  transition: "opacity 500ms ease-in-out"
});

const _tmpl$$1 = /*#__PURE__*/web.template(`<div><li></li></div>`, 4),
  _tmpl$2 = /*#__PURE__*/web.template(`<li></li>`, 2);
function DetailPannel(props) {
  return (() => {
    const _el$ = _tmpl$$1.cloneNode(true),
      _el$2 = _el$.firstChild;
    web.addEventListener(_el$, "transitionend", props.onTransitionEnd);
    const _ref$ = props.ref;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : props.ref = _el$;
    web.className(_el$, popper + ' ' + opacity_trans);
    web.insert(_el$2, () => `浏览量:${props.data.hit}`);
    web.insert(_el$, (() => {
      const _c$ = web.memo(() => !!props.data.avgTOP);
      return () => _c$() && [(() => {
        const _el$3 = _tmpl$2.cloneNode(true);
        web.insert(_el$3, () => `平均浏览时间:${toTime(props.data.avgTOP)}`);
        return _el$3;
      })(), (() => {
        const _el$4 = _tmpl$2.cloneNode(true);
        web.insert(_el$4, () => `总浏览时间:${toTime(parseFloat(props.data.avgTOP) * parseInt(props.data.hit), 0)}`);
        return _el$4;
      })()];
    })(), null);
    web.effect(_p$ => {
      const _v$ = props.show,
        _v$2 = props.style;
      _v$ !== _p$._v$ && web.setAttribute(_el$, "data-show", _p$._v$ = _v$);
      _p$._v$2 = web.style(_el$, _v$2, _p$._v$2);
      return _p$;
    }, {
      _v$: undefined,
      _v$2: undefined
    });
    return _el$;
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

const _tmpl$ = /*#__PURE__*/web.template(`<span></span>`, 2);
const API_PREFIX = 'https://yukicat-ga-hit.vercel.app/api/ga/?page=';
function PageView({
  path: path_raw,
  raw
}) {
  const path = path_raw + (path_raw.endsWith('/') ? '' : '/');
  const [data] = solidJs.createResource(path, path => fetch(API_PREFIX + path).then(r => r.json()));
  const error = data.error;
  const _rawHit = raw.replace(/<\/?span>/g, '');
  const [showPannel, setShowPannel] = solidJs.createSignal(false);
  const [mountPannel, setMountPannel] = solidJs.createSignal(false);
  const [ticker, setTicker] = solidJs.createSignal();
  const [popperStyle, setPopperStyles] = solidJs.createSignal({
    position: 'absolute',
    left: 0,
    top: 0,
    width: 'max-content'
  });
  let refEle;
  let refPopper;
  const updatePosition = async () => {
    const position = await dom.computePosition(refEle, refPopper, {
      placement: 'top',
      middleware: [dom.shift(), dom.flip()]
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
  solidJs.onCleanup(() => {
    clearTimeout(ticker());
    cleanupAutoUpdate?.();
  }); //cleaner
  return (() => {
    const _el$ = _tmpl$.cloneNode(true);
    const _ref$ = refEle;
    typeof _ref$ === "function" ? web.use(_ref$, _el$) : refEle = _el$;
    _el$.$$click = () => {
      if (ticker()) {
        clearTimeout(ticker());
        setTicker(undefined);
      }
      const nextShowPannel = setShowPannel(prev => !prev);
      if (nextShowPannel) {
        solidJs.batch(() => {
          setMountPannel(true);
          setTicker(setTimeout(() => {
            solidJs.batch(() => {
              setShowPannel(false);
              setTicker(undefined);
            });
          }, 5000));
        });
        updatePosition();
        cleanupAutoUpdate = dom.autoUpdate(refEle, refPopper, updatePosition);
      }
    };
    web.setAttribute(_el$, "data-raw", raw);
    web.className(_el$, styleClickable);
    web.insert(_el$, () => error ? _rawHit.replace(/\d{1,}/, '-') : data() ? _rawHit.replace(/\d{1,}/, data()[0].hit) : _rawHit, null);
    web.insert(_el$, (() => {
      const _c$ = web.memo(() => !!mountPannel());
      return () => _c$() && web.createComponent(web.Portal, {
        get children() {
          return web.createComponent(DetailPannel, {
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
web.delegateEvents(["click"]);

const initPV = () => {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      const raw = element.innerText;
      element.innerText = '';
      web.render(() => web.createComponent(PageView, {
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

exports.initPV = initPV;
//# sourceMappingURL=index.js.map
