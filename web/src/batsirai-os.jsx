import React from "react";
import { createPortal } from "react-dom";
import { DesktopAssetIcon, OsIcon } from "./os-icons.jsx";
import { GALLERY_GROUPS, GALLERY_ITEMS, GALLERY_FILTERS, compareGalleryGroups } from "./gallery-data.js";


// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', { detail: edits }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({ title = 'Tweaks', children }) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;

  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y)),
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);

  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);

  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy),
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;
  return (
    <>
      <style>{__TWEAKS_STYLE}</style>
      <div ref={dragRef} className="twk-panel" data-omelette-chrome=""
           style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}>
        <div className="twk-hd" onMouseDown={onDragStart}>
          <b>{title}</b>
          <button className="twk-x" aria-label="Close tweaks"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={dismiss}>✕</button>
        </div>
        <div className="twk-body">
          {children}
        </div>
      </div>
    </>
  );
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({ label, children }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

function TweakRow({ label, value, children, inline = false }) {
  return (
    <div className={inline ? 'twk-row twk-row-h' : 'twk-row'}>
      <div className="twk-lbl">
        <span>{label}</span>
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) {
  return (
    <TweakRow label={label} value={`${value}${unit}`}>
      <input type="range" className="twk-slider" min={min} max={max} step={step}
             value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </TweakRow>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl"><span>{label}</span></div>
      <button type="button" className="twk-toggle" data-on={value ? '1' : '0'}
              role="switch" aria-checked={!!value}
              onClick={() => onChange(!value)}><i /></button>
    </div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = (o) => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({ 2: 16, 3: 10 }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = (s) => {
      const m = options.find((o) => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return <TweakSelect label={label} value={value} options={options}
                        onChange={(s) => onChange(resolve(s))} />;
  }
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;

  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };

  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <TweakRow label={label}>
      <div ref={trackRef} role="radiogroup" onPointerDown={onPointerDown}
           className={dragging ? 'twk-seg dragging' : 'twk-seg'}>
        <div className="twk-seg-thumb"
             style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
                      width: `calc((100% - 4px) / ${n})` }} />
        {opts.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const v = typeof o === 'object' ? o.value : o;
          const l = typeof o === 'object' ? o.label : o;
          return <option key={v} value={v}>{l}</option>;
        })}
      </select>
    </TweakRow>
  );
}

function TweakText({ label, value, placeholder, onChange }) {
  return (
    <TweakRow label={label}>
      <input className="twk-field" type="text" value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)} />
    </TweakRow>
  );
}

function TweakNumber({ label, value, min, max, step = 1, unit = '', onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return (
    <div className="twk-num">
      <span className="twk-num-lbl" onPointerDown={onScrubStart}>{label}</span>
      <input type="number" value={value} min={min} max={max} step={step}
             onChange={(e) => onChange(clamp(Number(e.target.value)))} />
      {unit && <span className="twk-num-unit">{unit}</span>}
    </div>
  );
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}

const __TwkCheck = ({ light }) => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 7.2 5.8 10 11 4.2" fill="none" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          stroke={light ? 'rgba(0,0,0,.78)' : '#fff'} />
  </svg>
);

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({ label, value, options, onChange }) {
  if (!options || !options.length) {
    return (
      <div className="twk-row twk-row-h">
        <div className="twk-lbl"><span>{label}</span></div>
        <input type="color" className="twk-swatch" value={value}
               onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = (o) => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {options.map((o, i) => {
          const colors = Array.isArray(o) ? o : [o];
          const [hero, ...rest] = colors;
          const sup = rest.slice(0, 4);
          const on = key(o) === cur;
          return (
            <button key={i} type="button" className="twk-chip" role="radio"
                    aria-checked={on} data-on={on ? '1' : '0'}
                    aria-label={colors.join(', ')} title={colors.join(' · ')}
                    style={{ background: hero }}
                    onClick={() => onChange(o)}>
              {sup.length > 0 && (
                <span>
                  {sup.map((c, j) => <i key={j} style={{ background: c }} />)}
                </span>
              )}
              {on && <__TwkCheck light={__twkIsLight(hero)} />}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}

function TweakButton({ label, onClick, secondary = false }) {
  return (
    <button type="button" className={secondary ? 'twk-btn secondary' : 'twk-btn'}
            onClick={onClick}>{label}</button>
  );
}

/* batsirai.os — menus, terminal, command palette, app context */

const AppCtx = React.createContext(null);
const useApp = () => React.useContext(AppCtx);

function useMediaQuery(query) {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

function useHoverCapable() {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}

/* ─── Reusable drag hook for modals + floating windows ─── */
function useDrag() {
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const start = React.useRef(null);

  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - start.current.px;
      const dy = p.clientY - start.current.py;
      setPos({ x: start.current.x + dx, y: start.current.y + dy });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging]);

  const onDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input') ||
        e.target.closest('iframe') || e.target.closest('a')) return;
    const p = e.touches ? e.touches[0] : e;
    start.current = { px: p.clientX, py: p.clientY, x: pos.x, y: pos.y };
    setDragging(true);
    e.stopPropagation();
  };

  return { pos, dragging, onDown };
}

/* ─── Menu dropdown primitive ─── */
function useMenu() {
  const [open, setOpen] = React.useState(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!e.target.closest('.mb-item') && !e.target.closest('.menu-pop')) setOpen(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  return [open, setOpen];
}

function MenuItem({ label, kbd, checked, disabled, onClick, sub, hasSub }) {
  return (
    <div
      className={`mi ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} ${hasSub ? 'has-sub' : ''}`}
      onClick={(e) => { e.stopPropagation(); if (!disabled) onClick && onClick(); }}>
      <span>{label}</span>
      {kbd && <span className="kbd">{kbd}</span>}
    </div>
  );
}
function MenuSep() { return <hr />; }
function MenuLabel({ children }) { return <div className="mi-sub">{children}</div>; }

/* ─── The bar ─── */
function MenuBar({ now }) {
  const app = useApp();
  const [open, setOpen] = useMenu();
  const musicCompact = useMediaQuery('(max-width: 640px)');

  const toggleMusic = () => {
    if (musicCompact) {
      app.setTab('music');
      return;
    }
    app.setShowMiniPlayer(!app.showMiniPlayer);
  };

  const tagFilters = ['ALL','BUILT','FOUNDED','LED','EXITED'];

  return (
    <div className="menubar">
      <div className="mb-logo">
        <span className="glyph"><OsIcon name="logo" size="menubar" /></span>
        <span>batsirai.os</span>
      </div>

      {/* FILE */}
      <div className={`mb-item ${open === 'file' ? 'open' : ''}`}
           onClick={(e) => { e.stopPropagation(); setOpen(open === 'file' ? null : 'file'); }}>
        File
        {open === 'file' && (
          <div className="menu-pop" onClick={() => setOpen(null)}>
            <MenuItem label="Open resume.pdf ↗"
              onClick={() => window.open('Batsirai-Chada-Resume.pdf', '_blank')} kbd="⌘O" />
            <MenuItem label="Save snapshot.png" onClick={() => app.snapshot()} kbd="⌘S" />
            <MenuItem label="Print dashboard" onClick={() => window.print()} kbd="⌘P" />
            <MenuSep />
            <MenuLabel>Recent applications</MenuLabel>
            <MenuItem label="✓ PostHog · Technical Ex-Founder" disabled />
            <MenuItem label="(no others; single-target)" disabled />
            <MenuSep />
            <MenuItem label="Quit" onClick={() => app.openPalette('exit')} kbd="⌘Q" />
          </div>
        )}
      </div>

      {/* VIEW */}
      <div className={`mb-item ${open === 'view' ? 'open' : ''}`}
           onClick={(e) => { e.stopPropagation(); setOpen(open === 'view' ? null : 'view'); }}>
        View
        {open === 'view' && (
          <div className="menu-pop" onClick={() => setOpen(null)}>
            <MenuLabel>Theme</MenuLabel>
            <MenuItem label="PostHog"  checked={app.palette==='posthog'}  onClick={() => app.setPalette('posthog')} />
            <MenuItem label="Apple"    checked={app.palette==='apple'}    onClick={() => app.setPalette('apple')} />
            <MenuItem label="Terminal" checked={app.palette==='terminal'} onClick={() => app.setPalette('terminal')} />
            <MenuSep />
            <MenuItem label="Mono everywhere" checked={app.monoEverywhere}
              onClick={() => app.setMono(!app.monoEverywhere)} />
            <MenuItem label="Show desktop icons" checked={app.showDesktop}
              onClick={() => app.setShowDesktop(!app.showDesktop)} />
            <MenuItem label="Show paper grain" checked={app.showGrain}
              onClick={() => app.setShowGrain(!app.showGrain)} />
            <MenuItem label="Show mini music player" checked={app.showMiniPlayer}
              onClick={() => app.setShowMiniPlayer(!app.showMiniPlayer)} kbd="⌘M" />
            <MenuSep />
            <MenuItem label="Reset window position" onClick={() => app.resetWindow()} kbd="⌘0" />
          </div>
        )}
      </div>

      {/* CAREER */}
      <div className={`mb-item ${open === 'career' ? 'open' : ''}`}
           onClick={(e) => { e.stopPropagation(); setOpen(open === 'career' ? null : 'career'); }}>
        Career
        {open === 'career' && (
          <div className="menu-pop" onClick={() => setOpen(null)}>
            <MenuLabel>Filter timeline by tag</MenuLabel>
            {tagFilters.map((t) => (
              <MenuItem key={t} label={t==='ALL' ? 'All milestones' : t.toLowerCase()}
                checked={app.tagFilter===t}
                onClick={() => app.setTagFilter(t)} />
            ))}
            <MenuSep />
            <MenuLabel>Jump to</MenuLabel>
            <MenuItem label="↳ Bio"                   onClick={() => app.jumpTo('s-kpis')} />
            <MenuItem label="↳ Builder Timeline"      onClick={() => app.jumpTo('s-timeline')} />
            <MenuItem label="↳ Experiment Scoreboard" onClick={() => app.jumpTo('s-exp')} />
            <MenuItem label="↳ Values in Practice"    onClick={() => app.jumpTo('s-values')} />
            <MenuItem label="↳ Currently Building"    onClick={() => app.jumpTo('s-commits')} />
            <MenuItem label="↳ My Music"               onClick={() => app.jumpTo('s-music')} />
            <MenuItem label="↳ Live PostHog Loop"     onClick={() => app.jumpTo('s-live')} />
            <MenuSep />
            <MenuItem label="Expand all milestones" onClick={() => app.tlExpandAll(true)} />
            <MenuItem label="Collapse all"          onClick={() => app.tlExpandAll(false)} />
          </div>
        )}
      </div>

      {/* RUN */}
      <div className={`mb-item ${open === 'run' ? 'open' : ''}`}
           onClick={(e) => { e.stopPropagation(); setOpen(open === 'run' ? null : 'run'); }}>
        Run
        {open === 'run' && (
          <div className="menu-pop" onClick={() => setOpen(null)}>
            <MenuLabel>Scripts</MenuLabel>
            <MenuItem label="why_hire.sh"            onClick={() => app.runScript('why_hire')} />
            <MenuItem label="check_availability.sh"  onClick={() => app.runScript('availability')} />
            <MenuItem label="ping_batsirai.sh"       onClick={() => app.runScript('ping')} />
            <MenuItem label="request_interview.sh"   onClick={() => app.runScript('interview')} />
            <MenuItem label="benchmark_vs_role.sh"   onClick={() => app.runScript('benchmark')} />
            <MenuSep />
            <MenuItem label="apply_to_posthog.sh"    onClick={() => app.runScript('apply')} kbd="↵" />
            <MenuSep />
            <MenuItem label="Open command palette…" onClick={() => app.openPalette()} kbd="⌘K" />
          </div>
        )}
      </div>

      {/* HELP */}
      <div className={`mb-item ${open === 'help' ? 'open' : ''}`}
           onClick={(e) => { e.stopPropagation(); setOpen(open === 'help' ? null : 'help'); }}>
        Help
        {open === 'help' && (
          <div className="menu-pop" onClick={() => setOpen(null)}>
            <MenuItem label="What is this?"  onClick={() => app.runScript('whatami')} />
            <MenuItem label="Keyboard shortcuts" onClick={() => app.runScript('keys')} />
            <MenuItem label="About batsirai.os" onClick={() => app.runScript('about')} />
          </div>
        )}
      </div>

      <div className="mb-spacer"></div>
      <div className="mb-right">
        <button className={`mb-music-toggle ${app.showMiniPlayer && !musicCompact ? 'on' : ''}`}
                onClick={toggleMusic}
                title={musicCompact ? 'Open Music tab' : (app.showMiniPlayer ? 'Hide mini player (⌘M)' : 'Show mini player (⌘M)')}>
          {app.showMiniPlayer ? (
            <span className="mb-eq"><i></i><i></i><i></i><i></i></span>
          ) : (
            <span className="mb-note">♪</span>
          )}
        </button>
        <span className="live"><span className="live-dot"></span> rec</span>
        <MenuBarCmdk />
        <span>v0.2</span>
        <span>{now}</span>
      </div>
    </div>
  );
}

/* ─── Terminal modal ─── */
const SCRIPTS = {
  why_hire: {
    title: "~/career/why_hire.sh",
    lines: [
      { p: "$ ./why_hire.sh --target=posthog --role='technical ex-founder'", kind: 'cmd' },
      { wait: 220 },
      { out: "compiling argument...", kind: 'out' },
      { wait: 350 },
      { out: "01  shipped 9 products across SaaS, marketplaces, AI, creator tools.", b: ['9'] },
      { out: "02  founded → exited twice. SongSuggest (sold) + Quickstaff (sold 2022)." },
      { out: "03  ran experiments with money attached — $2M VAT recovered, +11% activation." },
      { out: "04  currently shipping Already Loved + product shipper at Ensurall." },
      { wait: 220 },
      { out: "→ verdict: hires builders who can produce numbers and tell the story.", kind: 'ok' },
      { out: "→ that is, demonstrably, my entire career.", kind: 'ok' },
    ],
  },
  availability: {
    title: "~/career/check_availability.sh",
    lines: [
      { p: "$ ./check_availability.sh", kind: 'cmd' },
      { wait: 240 },
      { out: "current commitments → Already Loved (founder-led, day job)" },
      { out: "" },
      { out: "interview availability (next 14 days)", kind: 'warn' },
      { out: "  mon  ████████░░░░░░░░░░  09:00–13:00 GMT" },
      { out: "  tue  ░░░░████████████░░  10:00–18:00 GMT" },
      { out: "  wed  ████████████░░░░░░  09:00–15:00 GMT" },
      { out: "  thu  ░░░░░░░░████████░░  13:00–17:00 GMT" },
      { out: "  fri  ████████████████░░  09:00–17:00 GMT" },
      { wait: 200 },
      { out: "→ async-friendly. team-fit chat in any of the slots above.", kind: 'ok' },
    ],
  },
  ping: {
    title: "~/career/ping_batsirai.sh",
    lines: [
      { p: "$ ./ping_batsirai.sh", kind: 'cmd' },
      { wait: 200 },
      { out: "PING batsirai@gmail.com (mailto): bytes=0 ttl=64" },
      { out: "reply received in 0.04s" },
      { out: "" },
      { out: "→ opening mail client...", kind: 'ok' },
      { do: () => window.location.href = 'mailto:batsirai@gmail.com?subject=Hi%20from%20PostHog' },
    ],
  },
  interview: {
    title: "~/career/request_interview.sh",
    lines: [
      { p: "$ ./request_interview.sh --employer=posthog", kind: 'cmd' },
      { wait: 240 },
      { out: "checking calendar..." },
      { wait: 320 },
      { out: "calendar OK. all green this week.", kind: 'ok' },
      { out: "" },
      { out: "preferred next steps:" },
      { out: "  1. 30-min culture chat" },
      { out: "  2. async take-home if useful (I'll already have one)" },
      { out: "  3. live working session — I learn by building" },
      { out: "" },
      { out: "→ reply to this dashboard, or just email me.", kind: 'ok' },
    ],
  },
  benchmark: {
    title: "~/career/benchmark_vs_role.sh",
    lines: [
      { p: "$ ./benchmark_vs_role.sh --role='technical ex-founder'", kind: 'cmd' },
      { wait: 240 },
      { out: "loading role description from posthog/careers..." },
      { wait: 250 },
      { out: "matching..." },
      { wait: 300 },
      { out: "" },
      { out: "  founded a company           ✓ Quickstaff (sold 2022), SongSuggest (sold)", kind: 'ok' },
      { out: "  shipped technical product   ✓ Already Loved · render pipeline", kind: 'ok' },
      { out: "  scaled product 0 → 100k+    ✓ Overflow (180k) · Buffer (150k MAU)", kind: 'ok' },
      { out: "  growth / activation work    ✓ Buffer +11% activation (led growth)", kind: 'ok' },
      { out: "  comfortable with data       ✓ this dashboard exists", kind: 'ok' },
      { out: "  uses posthog already        ⚠ instrumenting this page", kind: 'warn' },
      { out: "" },
      { out: "→ fit score: 6/6.  cover letter not needed; this is the cover letter.", kind: 'ok' },
    ],
  },
  apply: {
    title: "~/career/apply_to_posthog.sh",
    lines: [
      { p: "$ ./apply_to_posthog.sh --serious=true", kind: 'cmd' },
      { wait: 200 },
      { out: "[1/6] packaging career history       ........ ok", kind: 'ok' },
      { wait: 220 },
      { out: "[2/6] verifying experiment receipts  ........ ok", kind: 'ok' },
      { wait: 220 },
      { out: "[3/6] confirming session replay on   ........ ok", kind: 'ok' },
      { wait: 220 },
      { out: "[4/6] pre-flight: humour calibrated  ........ ok", kind: 'ok' },
      { wait: 220 },
      { out: "[5/6] resume.pdf attached            ........ ok", kind: 'ok' },
      { wait: 220 },
      { out: "[6/6] submitting to talent team      ........ ", kind: 'out' },
      { wait: 600 },
      { out: "                                              SENT.", kind: 'ok' },
      { wait: 220 },
      { out: "" },
      { out: "you are reading the submission.", kind: 'warn' },
      { out: "if you've read this far, that's the funnel working.", kind: 'warn' },
    ],
  },
  whatami: {
    title: "~/help/whatami",
    lines: [
      { out: "batsirai.os — a single-page career dashboard.", kind: 'out' },
      { out: "built as a job application to posthog." },
      { out: "" },
      { out: "use the menus above. ⌘K opens a command palette." },
      { out: "click the lights on the title bar; drag the window." },
      { out: "everything live is real (or close enough to make the point)." },
    ],
  },
  keys: {
    title: "~/help/keyboard_shortcuts",
    lines: [
      { out: "  ⌘K          command palette" },
      { out: "  ⌘0          reset window position" },
      { out: "  ⌘O          open resume" },
      { out: "  ⌘P          print dashboard" },
      { out: "  ⌘S          save snapshot" },
      { out: "  esc         close this terminal" },
      { out: "  dbl-click   title bar → recenter window" },
    ],
  },
  about: {
    title: "~/help/about",
    lines: [
      { out: "batsirai.os v0.2", kind: 'out' },
      { out: "an original retro-dashboard interface." },
      { out: "no hedgehogs were harmed in the making of this page." },
      { out: "" },
      { out: "design + build → batsirai chada, may 2026." },
    ],
  },
};

function Terminal({ scriptId, onClose, onRun }) {
  const script = SCRIPTS[scriptId];
  const [shown, setShown] = React.useState([]);
  const bodyRef = React.useRef(null);
  const { pos, dragging, onDown } = useDrag();

  React.useEffect(() => {
    setShown([]);
    if (!script) return;
    let cancelled = false;
    let i = 0;
    function step() {
      if (cancelled) return;
      if (i >= script.lines.length) return;
      const line = script.lines[i];
      i++;
      if (line.wait) { setTimeout(step, line.wait); return; }
      if (line.do)   { line.do(); step(); return; }
      setShown(s => [...s, line]);
      setTimeout(() => {
        if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      }, 0);
      setTimeout(step, 90);
    }
    step();
    return () => { cancelled = true; };
  }, [scriptId]);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!script) return null;
  return (
    <div className="term-backdrop" onClick={onClose}>
      <div className={`term ${dragging ? 'dragging' : ''}`}
           onClick={(e) => e.stopPropagation()}
           style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
        <div className="term-bar" onMouseDown={onDown} onTouchStart={onDown}
             style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
          <div className="dots"><i className="r" onClick={onClose}></i><i className="y"></i><i className="g"></i></div>
          <div className="t-title">{script.title}</div>
          <button className="t-close" onClick={onClose}>×</button>
        </div>
        <div className="term-body" ref={bodyRef}>
          {shown.map((line, idx) => (
            <div className="row" key={idx}>
              {line.p && <span className="prompt">{line.p}</span>}
              {line.cmd && <span className="cmd">{line.cmd}</span>}
              {line.out !== undefined && (
                <span className={line.kind === 'ok' ? 'ok' : line.kind === 'warn' ? 'warn' : 'out'}>
                  {line.out}
                </span>
              )}
            </div>
          ))}
          <div className="row"><span className="prompt">$</span> <span className="caret"></span></div>
        </div>
        <div className="term-actions">
          <span style={{fontSize: 10, color: '#8C8470', alignSelf:'center', marginRight: 8}}>try next:</span>
          {['why_hire','availability','benchmark','interview','apply'].filter(s => s !== scriptId).slice(0,3).map(s => (
            <button key={s} onClick={() => onRun(s)}>./{s}.sh</button>
          ))}
          <button onClick={onClose} style={{marginLeft: 'auto', borderColor:'#B8442D'}}>esc</button>
        </div>
      </div>
    </div>
  );
}

const CMDK_DISCOVERED_KEY = 'batsirai-cmdk-discovered';
const CMDK_EXIT_INTENT_KEY = 'batsirai-cmdk-exit-intent';
const FIRST_EXP_COLLAPSED_KEY = 'batsirai-first-exp-collapsed';
const CMDK_NUDGE_AFTER_MS = 60_000;
const CMDK_NUDGE_MIN_READ_MS = 20_000;
const BOOK_CHAT_URL = 'https://calendar.app.google/LLHzx2oSeHBKtppG7';
const POSTHOG_EX_FOUNDER_ROLE_URL = 'https://posthog.com/careers/technical-ex-founder';

function useCmdkDiscovered() {
  const [discovered, setDiscovered] = React.useState(() => {
    try { return localStorage.getItem(CMDK_DISCOVERED_KEY) === '1'; } catch { return false; }
  });
  const markDiscovered = React.useCallback(() => {
    setDiscovered(true);
    try { localStorage.setItem(CMDK_DISCOVERED_KEY, '1'); } catch {}
  }, []);
  return [discovered, markDiscovered];
}

function useCmdkNudge(cmdkDiscovered) {
  const [nudge, setNudge] = React.useState(false);
  const pageStart = React.useRef(Date.now());
  const tabsSeen = React.useRef(new Set(['readme']));
  const fired = React.useRef(false);

  const activateNudge = React.useCallback((reason) => {
    if (cmdkDiscovered || fired.current) return;
    fired.current = true;
    setNudge(true);
    capturePh('command_palette_nudge_shown', { reason });
  }, [cmdkDiscovered]);

  React.useEffect(() => {
    if (cmdkDiscovered) return;
    const id = window.setTimeout(() => activateNudge('timer'), CMDK_NUDGE_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [cmdkDiscovered, activateNudge]);

  const noteTabVisit = React.useCallback((tabId) => {
    if (cmdkDiscovered || fired.current) return;
    tabsSeen.current.add(tabId);
    const elapsed = Date.now() - pageStart.current;
    if (elapsed >= CMDK_NUDGE_MIN_READ_MS && tabsSeen.current.size >= 2) {
      activateNudge('explored');
    }
  }, [cmdkDiscovered, activateNudge]);

  return [nudge, noteTabVisit];
}

function MobileBookBar() {
  const app = useApp();
  const compact = useMediaQuery('(max-width: 640px)');
  const visible = compact && !app?.paletteOpen;

  React.useEffect(() => {
    document.documentElement.classList.toggle('mobile-book-bar-on', visible);
    return () => document.documentElement.classList.remove('mobile-book-bar-on');
  }, [visible]);

  if (!visible) return null;

  return (
    <a
      href={BOOK_CHAT_URL}
      target="_blank"
      rel="noreferrer"
      className="mobile-book-bar mobile-book-bar--visible"
      aria-label="Book a chat"
      onClick={() => capturePh('mobile_book_bar_click')}
    >
      <span className="mobile-book-bar-dot" aria-hidden="true" />
      <span>Book a chat →</span>
    </a>
  );
}

function MobileCmdkFab() {
  const app = useApp();
  const compact = useMediaQuery('(max-width: 640px)');
  if (!app || !compact || app.paletteOpen) return null;
  const nudge = app.cmdkNudge && !app.cmdkDiscovered;
  return (
    <button
      type="button"
      className={`mobile-cmdk-fab${nudge ? ' mobile-cmdk-fab--nudge' : ''}`}
      onClick={() => app.openPalette('mobile_fab')}
      aria-label="Open extras menu"
    >
      <span className="mobile-cmdk-fab-icon" aria-hidden="true">🎁</span>
      <span className="mobile-cmdk-fab-hint">extras</span>
    </button>
  );
}

function CmdkTrigger({ compact = false, className = '', nudge = false }) {
  const app = useApp();
  const highlight = nudge || app.cmdkNudge;
  return (
    <button
      type="button"
      className={`cmdk-trigger ${highlight ? 'cmdk-trigger--nudge' : ''} ${compact ? 'cmdk-trigger--compact' : ''} ${className}`.trim()}
      onClick={(e) => { e.stopPropagation(); app.openPalette('button'); }}
      aria-label="Open command palette (⌘K)"
    >
      {!compact && <span className="cmdk-trigger-label">Try command palette</span>}
      <kbd className="cmdk-trigger-kbd">⌘K</kbd>
    </button>
  );
}

function MenuBarCmdk() {
  const app = useApp();
  const nudge = app.cmdkNudge && !app.cmdkDiscovered;
  return (
    <span className={`mb-cmdk-wrap ${nudge ? 'mb-cmdk-wrap--nudge' : ''}`}>
      {nudge && (
        <span className="cmdk-nudge-callout" aria-hidden="true">
          <span className="cmdk-nudge-arrow">→</span>
          <span className="cmdk-nudge-text">try this</span>
        </span>
      )}
      <CmdkTrigger compact nudge={nudge} />
    </span>
  );
}

function CmdkPromo() {
  const app = useApp();
  const compact = useMediaQuery('(max-width: 640px)');
  if (app.cmdkDiscovered) return null;
  if (compact) {
    return (
      <div className="cmdk-promo cmdk-promo--mobile">
        <p className="cmdk-promo-copy">
          <strong>Explore first:</strong> swipe the tabs above, tap ventures, try{' '}
          <button type="button" className="cmdk-promo-inline" onClick={() => app.setTab('live')}>
            Live
          </button>
          . Tap <kbd>⌘</kbd> below for themes and scripts. Book a chat when it lands.
        </p>
      </div>
    );
  }
  return (
    <div className={`cmdk-promo ${app.cmdkNudge ? 'cmdk-promo--nudge' : ''}`}>
      <p className="cmdk-promo-copy">
        <strong>Explore the app:</strong> press <kbd>⌘K</kbd> to jump tabs, flip themes, and run
        scripts. Wander through Building and Live before you decide if we should talk.
      </p>
      <CmdkTrigger nudge={app.cmdkNudge} />
    </div>
  );
}

/* ─── Command palette ─── */
function CommandPalette({ commands, reason, onClose }) {
  const [q, setQ] = React.useState('');
  const [sel, setSel] = React.useState(0);
  const inputRef = React.useRef(null);
  const { pos, dragging, onDown } = useDrag();

  const filtered = React.useMemo(() => {
    if (!q) return commands;
    const s = q.toLowerCase();
    return commands.filter(c => (c.label + ' ' + (c.cat||'')).toLowerCase().includes(s));
  }, [q, commands]);

  React.useEffect(() => { inputRef.current?.focus(); }, []);
  React.useEffect(() => { setSel(0); }, [q]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(filtered.length-1, s+1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(0, s-1)); }
      if (e.key === 'Enter')     { e.preventDefault(); filtered[sel]?.run(); onClose(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [filtered, sel, onClose]);

  const exitBanner = reason === 'exit' ? (
    <div className="cmdp-banner">
      <span className="cmdp-banner-icon">⌘</span>
      <span>Wait — before you go, try a command. Esc closes this and keeps you here.</span>
    </div>
  ) : null;

  return createPortal(
    <div className="cmdp-back" onClick={onClose}>
      <div className={`cmdp ${dragging ? 'dragging' : ''}`}
           onClick={(e) => e.stopPropagation()}
           style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
        {exitBanner}
        <div className="cmdp-search" onMouseDown={onDown} onTouchStart={onDown}
             style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
          <span className="icon">⌘</span>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="type a command…" />
        </div>
        <div className="cmdp-list">
          {filtered.length === 0 && (
            <div className="cmdp-item" style={{color:'var(--muted)'}}>no commands match "{q}"</div>
          )}
          {filtered.map((c, i) => (
            <div key={c.label} className={`cmdp-item ${i===sel?'sel':''}`}
                 onMouseEnter={() => setSel(i)}
                 onClick={() => { c.run(); onClose(); }}>
              <span>{c.label}</span>
              <span className="cat">{c.cat}</span>
            </div>
          ))}
        </div>
        <div className="cmdp-foot">
          <span>↑↓ to navigate · ↵ to run · esc to close</span>
          <span>{filtered.length} of {commands.length}</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* batsirai.os — components */

/* ─── Desktop chrome ─── */
function DesktopIcons({ side, items, activeTab }) {
  return (
    <div className={`desktop-icons ${side}`}>
      {items.map((it, i) => {
        const active = it.tab && it.tab === activeTab;
        // Use <button> when there's an onClick (no href), <a> when there's a real href
        if (it.onClick && !it.href) {
          return (
            <button className={`di ${active ? 'active' : ''}`} key={i} type="button"
                    onClick={(e) => { e.preventDefault(); it.onClick(); }}>
              <div className="di-glyph">
                <DesktopAssetIcon name={it.icon} />
                {it.badge && <span className="badge">{it.badge}</span>}
              </div>
              <div className="di-label">
                {it.label}
                {it.sub && <small>{it.sub}</small>}
              </div>
            </button>
          );
        }
        return (
          <a className={`di ${active ? 'active' : ''}`} key={i}
             href={it.href || "#"}
             target={it.href && it.href.startsWith('http') ? "_blank" : undefined}
             rel="noreferrer"
             onClick={(e) => {
               if (it.onClick) { e.preventDefault(); it.onClick(); }
             }}>
            <div className="di-glyph">
              <DesktopAssetIcon name={it.icon} />
              {it.badge && <span className="badge">{it.badge}</span>}
            </div>
            <div className="di-label">
              {it.label}
              {it.sub && <small>{it.sub}</small>}
            </div>
          </a>
        );
      })}
    </div>
  );
}

/* ─── Draggable window ─── */
function DraggableWindow({ title, meta, children }) {
  const app = useApp();
  const compactChrome = useMediaQuery('(max-width: 640px)');
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const start = React.useRef(null);

  React.useEffect(() => {
    if (compactChrome) setPos({ x: 0, y: 0 });
  }, [compactChrome]);

  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - start.current.px;
      const dy = p.clientY - start.current.py;
      // Bound the drag so the window can't drift offscreen
      const maxX = Math.max(40, window.innerWidth * 0.06);
      const maxY = 24;
      const minY = -24;
      const nx = Math.max(-maxX, Math.min(maxX, start.current.x + dx));
      const ny = Math.max(minY, Math.min(maxY * 4, start.current.y + dy));
      setPos({ x: nx, y: ny });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging]);

  const onDown = compactChrome ? undefined : (e) => {
    const p = e.touches ? e.touches[0] : e;
    start.current = { px: p.clientX, py: p.clientY, x: pos.x, y: pos.y };
    setDragging(true);
  };

  return (
    <div
      className="window-wrap"
      style={{ transform: compactChrome ? undefined : `translate(${pos.x}px, ${pos.y}px)` }}>
      <main className={`window ${dragging ? 'dragging' : ''} ${compactChrome ? 'window--compact' : ''}`} data-screen-label="01 dashboard">
        <div
          className={`titlebar ${dragging ? 'dragging' : ''} ${compactChrome ? 'titlebar--compact' : ''}`}
          onMouseDown={onDown}
          onTouchStart={onDown}
          onDoubleClick={compactChrome ? undefined : () => setPos({ x: 0, y: 0 })}>
          <div className="lights" onMouseDown={(e) => e.stopPropagation()}>
            <span className="l1" title="close (opens ⌘K)"
                  onClick={(e) => { e.stopPropagation(); app?.openPalette?.('exit'); }}></span>
            <span className="l2" title="minimize"></span>
            <span className="l3" title="zoom"></span>
          </div>
          <div className="title"><b>{title}</b></div>
          <div className="meta">{meta}</div>
        </div>
        {children}
      </main>
    </div>
  );
}

function WindowHead() {
  return null; // legacy; superseded by ProfileSidebar + TabbedMain
}

/* ─── Profile sidebar (left of window body) ─── */
const ACHIEVEMENTS = [
  { icon: 'founder', label: 'founder × 5', tip: 'Founded or co-founded five companies.' },
  { icon: 'exits', label: '2 exits', tip: 'Two quiet exits: SongSuggest and Quickstaff.' },
  { icon: 'led', label: 'led × 3', tip: 'Led product at three companies before PostHog.' },
  { icon: 'growth', label: '+11%', tip: 'Grew active publishing at Buffer by 11% year-on-year.' },
  { icon: 'ai', label: 'early ai', tip: 'Shipped an LLM product in 2023, before it was trendy.' },
  { icon: 'users', label: '330k', tip: 'Products I have built have reached 330k+ users.' },
  { icon: 'revenue', label: '$5M+', tip: 'Influenced $5M+ per year in revenue at Ensurall.' },
  { icon: 'commits', label: '3k commits', tip: '3,000+ git commits shipped in 2026 alone.' },
];

function ProfileBlock({ title, extra, children, foldOnMobile = false, defaultOpen = false, hideOnMobile = false }) {
  const compact = useMediaQuery('(max-width: 640px)');
  if (hideOnMobile && compact) return null;
  if (!foldOnMobile || !compact) {
    return (
      <section className="ps-block">
        <div className="ps-block-head">
          {title}
          {extra}
        </div>
        {children}
      </section>
    );
  }
  return (
    <details className="ps-block ps-block--fold" defaultOpen={defaultOpen}>
      <summary className="ps-block-head">
        {title}
        {extra}
      </summary>
      <div className="ps-block-body">{children}</div>
    </details>
  );
}

function ProfileDetails() {
  return (
    <dl className="ps-meta">
      <dt>Reputation</dt><dd><span className="ps-rep">Builder · lvl 89</span></dd>
      <dt>Started shipping</dt><dd>15 years ago</dd>
      <dt>Pineapple on pizza</dt><dd><span className="ps-thumb">👍</span></dd>
      <dt>Located</dt><dd>Toronto, CA 🇨🇦</dd>
      <dt>Currently shipping</dt><dd>Already Loved</dd>
      <dt>Day job</dt><dd>Product shipper · Ensurall</dd>
      <dt>Looking at</dt><dd>PostHog · Tech Founder</dd>
    </dl>
  );
}

function ProfileLinks() {
  return (
    <div className="ps-links">
      <a href="https://alreadylovedkids.com" target="_blank" rel="noreferrer" title="current product"><span className="ps-l-icon"><OsIcon name="external" size="link" /></span><span>alreadylovedkids.com</span></a>
      <a href="https://github.com/Batsirai" target="_blank" rel="noreferrer" title="github"><span className="ps-l-icon"><OsIcon name="github" size="link" /></span><span>github</span></a>
      <a href="https://x.com/batsirai" target="_blank" rel="noreferrer" title="x / twitter"><span className="ps-l-icon"><OsIcon name="x" size="link" /></span><span>x.com/batsirai</span></a>
      <a href="https://www.linkedin.com/in/batsirai-chada/" target="_blank" rel="noreferrer" title="linkedin"><span className="ps-l-icon"><OsIcon name="linkedin" size="link" /></span><span>linkedin</span></a>
      <a href="mailto:batsirai@gmail.com" title="email"><span className="ps-l-icon"><OsIcon name="email" size="link" /></span><span>email</span></a>
      <a href="Batsirai-Chada-Resume.pdf" target="_blank" rel="noreferrer" title="resume.pdf"><span className="ps-l-icon"><OsIcon name="doc" size="link" /></span><span>resume.pdf</span></a>
    </div>
  );
}

function ProfileSidebar() {
  const hoverCapable = useHoverCapable();
  return (
    <aside className="profile-side">
      <div className="ps-photo">
        <image-slot
          id="batsirai-portrait"
          shape="rect"
          src="/posthog/portrait.webp"
          placeholder="drop a photo of you"
          style={{ width: '100%', display: 'block' }}>
        </image-slot>
      </div>
      <div className="ps-name">
        <h2>BATSIRAI CHADA <span className="flag" title="Canada · Zimbabwe">🇨🇦 🇿🇼</span></h2>
        <p className="ps-pronounce">pronounced: <span>Bats-her-eye</span></p>
        <div className="ps-tagline">Build. Ship. Learn. Repeat.</div>
        <div className="ps-role">tech founder · builder pm · ai producer</div>
        <ProfileApplicationHint />
        <a className="ps-cta"
           href={BOOK_CHAT_URL}
           target="_blank" rel="noreferrer"
           title="Book a 30-minute chat: PostHog Technical Ex-Founder interview">
          <span className="ps-cta-dot"></span>
          <span>Book a chat →</span>
        </a>
      </div>

      <ProfileBlock title="Details" foldOnMobile defaultOpen>
        <ProfileDetails />
      </ProfileBlock>

      <ProfileBlock title="Links" foldOnMobile hideOnMobile>
        <ProfileLinks />
      </ProfileBlock>

      <ProfileBlock title="Achievements" extra={<span className="ps-arrow">↗</span>} foldOnMobile hideOnMobile>
        <p className="ps-achievements-hint">
          {hoverCapable
            ? 'Career highlights — hover any badge for detail.'
            : 'Career highlights — tap any badge for detail.'}
        </p>
        <div className="ps-achievements">
          {ACHIEVEMENTS.map((a) => (
            <div
              key={a.label}
              className="ach"
              data-tip={a.tip}
              tabIndex={0}
              aria-label={`${a.label}: ${a.tip}`}
            >
              <div className="ach-sticker"><OsIcon name={a.icon} size="ach" /></div>
              <span className="ach-label">{a.label}</span>
            </div>
          ))}
        </div>
      </ProfileBlock>
    </aside>
  );
}

/* ─── Tabbed main content (right of profile sidebar) ─── */
function TabbedMain() {
  const app = useApp();
  const mobileTabs = useMediaQuery('(max-width: 640px)');
  const tabsRef = React.useRef(null);
  const tabRefs = React.useRef({});
  const BASE_TABS = [
    { id: 'readme',  label: 'Bio' },
    { id: 'timeline',label: 'Timeline' },
    { id: 'exp',     label: 'Experiments' },
    { id: 'values',  label: 'Values' },
    { id: 'building',label: 'Building' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'music',   label: 'Music' },
    { id: 'live',    label: 'Live' },
  ];
  const TABS = mobileTabs
    ? [...BASE_TABS, { id: 'links', label: 'Links' }]
    : BASE_TABS;
  const tab = app?.tab || 'readme';
  const setTab = app?.setTab || (() => {});

  const scrollActiveTabIntoView = React.useCallback((tabId) => {
    if (!mobileTabs) return;
    const container = tabsRef.current;
    const el = tabRefs.current[tabId];
    if (!container || !el) return;
    const left = el.offsetLeft - (container.clientWidth - el.offsetWidth) / 2;
    container.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [mobileTabs]);

  React.useEffect(() => {
    if (!mobileTabs && tab === 'links') setTab('readme');
  }, [mobileTabs, tab, setTab]);

  React.useEffect(() => {
    if (!mobileTabs) return;
    const id = requestAnimationFrame(() => scrollActiveTabIntoView(tab));
    return () => cancelAnimationFrame(id);
  }, [tab, mobileTabs, scrollActiveTabIntoView]);

  return (
    <section className="main-side">
      <div className="tabs" ref={tabsRef} role="tablist" aria-label="Sections">
        {TABS.map(t => (
          <button key={t.id}
            ref={(node) => {
              if (node) tabRefs.current[t.id] = node;
              else delete tabRefs.current[t.id];
            }}
            className={`tab ${tab === t.id ? 'on' : ''}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}>
            {t.label}
            {tab === t.id && <span className="tab-mark"></span>}
          </button>
        ))}
        <div className="tabs-spacer"></div>
        <span className="tabs-meta">↻ auto-refresh</span>
      </div>

      <div className="tab-body" key={tab}>
        {tab === 'readme' && <TabReadme />}
        {tab === 'timeline' && (
          <>
            <TabHeader
              title="Builder Timeline"
              sub="15 years · 10 entries · 4 founded + 1 co-founded + 3 led · click to expand"
              subMobile="10 entries · tap to expand"
            />
            <Timeline />
          </>
        )}
        {tab === 'exp' && (
          <>
            <TabHeader
              title="Experiment Scoreboard"
              sub="hypothesis → outcome → learning"
              subMobile="7 experiments · stacked"
            />
            <Experiments />
          </>
        )}
        {tab === 'values' && (
          <>
            <TabHeader
              title="Values in Practice"
              sub="five posthog values · one story each"
              subMobile="five values · tap to read"
            />
            <Values />
          </>
        )}
        {tab === 'building' && (
          <>
            <TabHeader
              title="Currently Building"
              sub="active products · live commits"
              subMobile="active builds · recent commits"
            />
            <div className="building-tab">
              <BuilderCred />
              <ActiveBuilds />
              <Commits />
            </div>
          </>
        )}
        {tab === 'gallery' && (
          <>
            <TabHeader
              title="Gallery"
              sub="41 items · UI I designed & shipped + Buffer off-sites"
              subMobile="My UI work & culture · tap to enlarge"
            />
            <Gallery />
          </>
        )}
        {tab === 'music' && (
          <>
            <TabHeader
              title="My Music"
              sub="things I wrote and / or recorded"
              subMobile="written & recorded"
            />
            <Music />
          </>
        )}
        {tab === 'live' && (
          <>
            <TabHeader
              title="Live PostHog Loop"
              sub="real-time · this very page · clocks in ET + yours"
              subMobile="live · ET + your timezone"
            />
            <div className="live-tab">
            <LiveClockStrip />
            <YourSession />
            <FunnelOfYou />
            <LiveLoop />
            <Survey />
            <PostHogPowered />
            </div>
          </>
        )}
        {tab === 'links' && (
          <>
            <TabHeader
              title="Links"
              sub="portfolio · social · resume · email"
              subMobile="tap to open"
            />
            <div className="links-tab">
              <ProfileLinks />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function TabHeader({ title, sub, subMobile }) {
  return (
    <div className="tab-head">
      <h2>{title}</h2>
      {subMobile ? (
        <>
          <span className="tab-head-sub tab-head-sub--desktop">{sub}</span>
          <span className="tab-head-sub tab-head-sub--mobile">{subMobile}</span>
        </>
      ) : (
        <span className="tab-head-sub">{sub}</span>
      )}
    </div>
  );
}

/* ─── Venture info cards (readme + bio) ─── */
const VentureCtx = React.createContext(null);

const PRESS_MENTIONS = [
  {
    id: 'buffer-diaries',
    outlet: 'Buffer',
    series: 'Buffer Diaries',
    title: 'Trust, Transparency, and Curiosity',
    date: 'Apr 2023',
    quote: 'After competing with about 4,000 applicants, I was fortunate to be offered the role. Life changing.',
    excerpt: 'Growth PM on culture, remote work, and the four-day week.',
    url: 'https://buffer.com/resources/buffer-diaries-batsirai/',
  },
  {
    id: 'overflow-billboard',
    outlet: 'Billboard',
    series: 'Billboard Pro',
    title: 'David Beside Goliath',
    date: 'Jan 2015',
    quote: 'The Overflow is betting a narrow focus will draw the attention of a market that\'s been underserved by traditional subscription services.',
    excerpt: 'Launch coverage of the genre-specific Christian music streaming service.',
    url: 'https://www.billboard.com/pro/overflow-christian-subscription-streaming-music-service/',
  },
];

const VENTURES = {
  'already-loved': {
    id: 'already-loved',
    name: 'Already Loved',
    years: '2024–present',
    role: 'Co-founder · lead engineer',
    status: 'Live · book sales from May 2026',
    tagline: 'AI-personalised identity books for preschoolers',
    summary: 'Founded with my wife. Not personalised stories — personalised identity formation for the preschool years. I own product, engineering, security, logs, and the AI image pipeline. No engineering team — me, AI, my wife, and our kids.',
    stack: 'TanStack Start · Convex · PostHog',
    coverImage: '/posthog/already-loved-book-cover.png',
    coverAlt: 'Sample Already Loved book cover — Simmone Is Already Loved',
    url: 'https://alreadylovedkids.com',
    timelineTitle: 'Already Loved',
  },
  ensurall: {
    id: 'ensurall',
    name: 'Ensurall · GVC',
    years: '2010–2022 · 2023–present',
    role: 'Product shipper (current) · product manager (2010–2022)',
    status: 'Day job · exclusive engagement',
    tagline: 'Extended car warranty · B2B + B2C commerce',
    summary: 'Architected ensurall.ca and the warranty commerce stack from 2010 as PM. Left for Buffer in 2022, came back in 2023 because shipping beats spec-writing. Now I find ideas, design them, and ship 2–3 micro-projects a week — the joy is still saying “here, I made this”.',
    stack: 'Visualforce · Apex · JavaScript',
    url: 'https://ensurall.ca',
    timelineTitle: 'Ensurall',
  },
  posthog: {
    id: 'posthog',
    name: 'PostHog',
    years: '2026 · applying',
    role: 'Technical Ex-Founder / AI PM (target role)',
    status: 'Why this application exists',
    tagline: 'Product analytics + data-informed iteration',
    summary: 'The factory is the product: faster build-ship-learn loops win. PostHog is closest to making autonomous companies real — analytics, experiments, feature flags, and PostHog Code. I want to help founders and enterprises run on those rails.',
    stack: 'PostHog · HogQL · agentic workflows',
    url: 'https://posthog.com',
  },
  songsuggest: {
    id: 'songsuggest',
    name: 'SongSuggest',
    years: '2010 · sold',
    role: 'Co-founder',
    status: 'Exit · award-winning',
    tagline: 'iPhone setlist tool for musicians',
    summary: 'Two musicians, neither app developers, shipping at the dawn of the App Store. Remote designers and devs across three continents. Industry press picked it up. A stranger once recommended our app to me at lunch — he had no idea I built it.',
    stack: 'iOS',
    timelineTitle: 'SongSuggest',
  },
  quickstaff: {
    id: 'quickstaff',
    name: 'Quickstaff',
    years: '2015–2022 · sold',
    role: 'Founder · primary shipper',
    status: 'Exit · 4.7★ Capterra',
    tagline: 'Bootstrapped B2B staff-scheduling SaaS',
    summary: 'Seven years compounding to a quiet strategic exit. I shipped every product update, test, and deploy — often learning the stack from YouTube the same day. The marketing site I built still runs unchanged four years later.',
    stack: 'Laravel · Quasar · Vue',
    url: 'https://www.quickstaffpro.com',
    timelineTitle: 'Quickstaff',
  },
  overflow: {
    id: 'overflow',
    name: 'The Overflow',
    years: '2013–2019',
    role: 'Co-founder',
    status: 'Wound down',
    tagline: 'First genre-specific music streaming platform',
    summary: 'Grew from 0 to 180,000 users with no paid marketing. Catalog UX rewrite cut internal ops time 80%. Curation travelled inside artist networks faster than ads. Shut down when angel funding ran out — the lesson stayed.',
    stack: 'iOS · Android · Web · Python · PHP',
    timelineTitle: 'The Overflow',
    press: PRESS_MENTIONS.find((p) => p.id === 'overflow-billboard'),
  },
  buffer: {
    id: 'buffer',
    name: 'Buffer',
    years: '2022–2023',
    role: 'Growth PM · led the growth team',
    status: '150k+ MAU · +11% activation',
    tagline: 'Social scheduling for creators and teams',
    summary: 'One of 4,000 applicants who made it inside. Owned freemium activation and pricing migration — $2M VAT recovered, +11% activation. Loved the team; left when the work became more PRDs than pull requests.',
    stack: 'TypeScript · Python',
    url: 'https://buffer.com',
    timelineTitle: 'Buffer',
    press: PRESS_MENTIONS.find((p) => p.id === 'buffer-diaries'),
  },
  'maverick-city': {
    id: 'maverick-city',
    name: 'Maverick City Music',
    years: '2019–2023',
    role: 'Led digital',
    status: '10k → 2M+ YouTube growth era',
    tagline: 'Grammy Award-winning worship collective · digital ecosystem',
    summary: 'Grammy Award-winning group of artists and songwriters. Built ecommerce, fan tooling, merch logistics, and writing-camp ops while the audience scaled by three orders of magnitude. The invisible infrastructure that holds up a visible brand.',
    stack: 'Webflow · WordPress',
    url: 'https://maverickcitymusic.com',
    timelineTitle: 'Maverick City Music',
  },
  cowriter: {
    id: 'cowriter',
    name: 'Cowriter',
    years: '2023',
    role: 'Founder',
    status: 'Shipped · early LLM bet',
    tagline: 'GPT-powered songwriting / lyric assistant',
    summary: 'Built before the LLM gold rush. Didn\'t nail the timing; got the muscle memory for prompt engineering and shipping AI products — the same muscle Already Loved runs on now.',
    stack: 'iOS · Android · OpenAI',
    url: 'https://www.getcowriter.com',
    timelineTitle: 'Cowriter',
  },
  'personal-agent': {
    id: 'personal-agent',
    name: 'Personal Agent',
    years: '2024–present',
    role: 'Creator · operator',
    status: '260+ skill sales',
    tagline: 'Agent-run skills marketplace business',
    summary: 'My OpenClaw / Hermes agent authors and sells Claude skills on ClawMart — two personas, 39 skills, entirely agent-built and agent-deployed. I read the meters; the agent ships.',
    stack: 'Hermes · Python · JavaScript',
    url: 'https://www.shopclawmart.com/creators/41476833-3478-44b6-8843-062f7c70955b',
    timelineTitle: 'Personal Agent',
  },
};

function ventureMilestoneIndex(venture) {
  if (!venture?.timelineTitle) return -1;
  return MILESTONES.findIndex((m) =>
    m.title === venture.timelineTitle || m.title.startsWith(venture.timelineTitle)
  );
}

function useVenturePopoverState() {
  const [state, setState] = React.useState(null);
  const closeTimer = React.useRef(null);

  const clearCloseTimer = React.useCallback(() => {
    clearTimeout(closeTimer.current);
  }, []);

  const close = React.useCallback(() => {
    clearCloseTimer();
    setState(null);
  }, [clearCloseTimer]);

  const open = React.useCallback((id) => {
    clearCloseTimer();
    setState({ id });
    capturePh('venture_card_opened', { id, name: VENTURES[id].name });
  }, [clearCloseTimer]);

  const scheduleClose = React.useCallback(() => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setState(null), 180);
  }, [clearCloseTimer]);

  const cancelClose = React.useCallback(() => {
    clearCloseTimer();
  }, [clearCloseTimer]);

  React.useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const ctx = React.useMemo(() => ({
    activeId: state?.id ?? null,
    open,
    close,
    scheduleClose,
    cancelClose,
  }), [state?.id, open, close, scheduleClose, cancelClose]);

  return { state, ctx };
}

function isVentureUiNode(node) {
  if (!node || !(node instanceof Node)) return false;
  return Boolean(node.closest?.('.ventm-pop, .ventm-back, .cover-lb-back'));
}

function VentureLink({ id, children, className = '' }) {
  const ctx = React.useContext(VentureCtx);
  const ref = React.useRef(null);
  if (!ctx || !VENTURES[id]) return children;

  const show = () => ctx.open(id);
  const isActive = ctx.activeId === id;

  return (
    <button
      ref={ref}
      type="button"
      className={`venture-link ${isActive ? 'venture-link-open' : ''} ${className}`.trim()}
      aria-expanded={isActive}
      aria-haspopup="dialog"
      onBlur={(e) => {
        if (isVentureUiNode(e.relatedTarget)) return;
        ctx.scheduleClose();
      }}
      onClick={(e) => {
        e.preventDefault();
        if (isActive) ctx.close();
        else show();
      }}
    >
      {children}
    </button>
  );
}

function VentureCoverThumb({ venture, onClick }) {
  if (!venture?.coverImage) return null;
  return (
    <button
      type="button"
      className="ventm-cover-thumb"
      onClick={onClick}
      aria-label={`View sample ${venture.name} book cover`}
    >
      <img
        src={venture.coverImage}
        alt=""
        width={104}
        height={104}
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />
      <span className="ventm-cover-thumb-label">view cover</span>
    </button>
  );
}

function VentureCoverLightbox({ src, alt, onClose }) {
  const ignoreBackdropUntil = React.useRef(Date.now() + 320);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function handleBackdropClick(e) {
    if (e.target !== e.currentTarget) return;
    if (Date.now() < ignoreBackdropUntil.current) return;
    onClose();
  }

  return createPortal(
    <div className="cover-lb-back" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Book cover preview">
      <figure className="cover-lb" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="cover-lb-close" onClick={onClose} aria-label="Close cover preview">×</button>
        <img src={src} alt={alt} width={680} height={680} decoding="async" />
        <figcaption>sample personalised cover</figcaption>
      </figure>
    </div>,
    document.body
  );
}

function VenturePopover({ venture, onClose, onCancelClose }) {
  const app = useApp();
  const popRef = React.useRef(null);
  const [coverOpen, setCoverOpen] = React.useState(false);
  const milestoneIdx = ventureMilestoneIndex(venture);
  const coverAlt = venture.coverAlt || `${venture.name} sample book cover`;

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !coverOpen) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, coverOpen]);

  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  function goTimeline() {
    onClose();
    app?.setTab('timeline');
    if (milestoneIdx >= 0) {
      window.setTimeout(() => app?.jumpToMilestone?.(milestoneIdx, true), 120);
    }
  }

  function openCover(e) {
    e.preventDefault();
    e.stopPropagation();
    onCancelClose();
    setCoverOpen(true);
    capturePh('venture_cover_open', { id: venture.id });
  }

  const popover = createPortal(
    <div className="ventm-back" onClick={onClose} role="presentation">
      <div
        ref={popRef}
        className={`ventm-pop${venture.coverImage ? ' ventm-pop--with-cover' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ventm-title"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="kpim ventm">
        <div className="kpim-titlebar">
          <div className="lights">
            <span className="l1" onClick={onClose} title="close"></span>
            <span className="l2" title="minimize"></span>
            <span className="l3" title="zoom"></span>
          </div>
          <div className="kpim-title">info · {venture.name.toLowerCase()}</div>
          <button className="kpim-close" onClick={onClose}>×</button>
        </div>
        <div className="kpim-body ventm-body">
          <div className={venture.coverImage ? 'ventm-layout ventm-layout--cover' : 'ventm-layout'}>
            {venture.coverImage && (
              <div className="ventm-cover-col">
                <VentureCoverThumb
                  venture={venture}
                  onClick={openCover}
                />
              </div>
            )}
            <div className="ventm-copy-col">
              <div className="ventm-status">{venture.status}</div>
              <h3 className="ventm-name" id="ventm-title">{venture.name}</h3>
              <div className="ventm-meta">
                <span>{venture.years}</span>
                <span className="ventm-dot">·</span>
                <span>{venture.role}</span>
              </div>
              <p className="ventm-tagline">{venture.tagline}</p>
              <p className="ventm-summary">{venture.summary}</p>
              <div className="ventm-stack">
                <span className="ventm-stack-label">stack</span>
                <span>{venture.stack}</span>
              </div>
              {venture.press && (
                <blockquote className="ventm-press">
                  <p className="ventm-press-quote">&ldquo;{venture.press.quote}&rdquo;</p>
                  <a
                    className="ventm-press-link"
                    href={venture.press.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      capturePh('venture_press_link', { id: venture.id, press: venture.press.id });
                      captureOutbound(venture.press.url, 'venture_press', { id: venture.id, press: venture.press.id });
                    }}
                  >
                    {venture.press.series} · {venture.press.date} ↗
                  </a>
                </blockquote>
              )}
            </div>
          </div>
        </div>
        <div className="kpim-foot ventm-foot">
          <span>click outside · <kbd>esc</kbd> to close</span>
          <div className="ventm-foot-actions">
            {milestoneIdx >= 0 && (
              <button type="button" className="kpim-foot-btn" onClick={goTimeline}>
                timeline →
              </button>
            )}
            {venture.press && (
              <a
                className="kpim-foot-btn ventm-ext"
                href={venture.press.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  capturePh('venture_press_link', { id: venture.id, press: venture.press.id });
                  captureOutbound(venture.press.url, 'venture_press', { id: venture.id, press: venture.press.id });
                }}
              >
                press ↗
              </a>
            )}
            {venture.url && (
              <a
                className="kpim-foot-btn ventm-ext"
                href={venture.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  capturePh('venture_external_link', { id: venture.id });
                  captureOutbound(venture.url, 'venture_site', { id: venture.id });
                }}
              >
                site ↗
              </a>
            )}
            <button type="button" className="kpim-foot-btn" onClick={onClose}>close</button>
          </div>
        </div>
      </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {popover}
      {coverOpen && venture.coverImage && (
        <VentureCoverLightbox
          src={venture.coverImage}
          alt={coverAlt}
          onClose={() => setCoverOpen(false)}
        />
      )}
    </>
  );
}

function TabReadme() {
  const { state: ventureState, ctx: ventureCtx } = useVenturePopoverState();
  const venture = ventureState ? VENTURES[ventureState.id] : null;

  return (
    <VentureCtx.Provider value={ventureCtx}>
    <div className="readme">
      <FirstExperienceStrip />
      <h1 className="readme-h1">
        Builder. Shipper. Singer.
        <span className="underscore"></span>
      </h1>
      <p className="readme-lede">
        Through 2022 I was a product manager. Thanks to AI, I&apos;m a product shipper now — and I take
        great joy in saying <em>here, I made this</em>. Fifteen years of building and shipping. Serial
        founder — two exits. Ex-Buffer PM. I&apos;ve sung in front of thousands. I love getting up every
        day to build and ship products: digital and musical ideas alike.
      </p>

      <CmdkPromo />

      <div className="readme-tldr">
        <div className="readme-tldr-label">tldr</div>
        <ul>
          <li>Building <VentureLink id="already-loved"><em>Already Loved</em></VentureLink> with my wife — shipping toward an autonomous company</li>
          <li>9 products shipped · 2 exits · 330k+ users reached · $5M+/yr influenced</li>
          <li>Day job: product shipper at <VentureLink id="ensurall">Ensurall</VentureLink> — 2–3 micro-projects/week on Salesforce</li>
          <li>Applying to <VentureLink id="posthog">PostHog</VentureLink> to help founders run faster <b>build → ship → learn</b> loops</li>
        </ul>
      </div>

      <KPIs />

      <blockquote className="readme-callout">
        <strong>The factory is the product.</strong> The faster the build-ship-learn loop,
        the higher your chances of success. That&apos;s what PostHog enables — speed of
        iteration powered by data-informed agentic agency. That&apos;s what I want to help
        bring to founders and enterprises: the environment where autonomous companies can
        flourish.
      </blockquote>

      <div className="bio">
        <p>
          What I love most is pointing at something live and saying <em>here, I made this</em>. The wonder
          of finding out a stranger on the other side of the world is using something I made in my basement
          never gets old. The first <VentureLink id="songsuggest">SongSuggest</VentureLink> user — somewhere we couldn't trace,
          maybe Dubai, maybe further. The first <VentureLink id="quickstaff">Quickstaff</VentureLink> customer in 2013 calling
          my co-founder to ask if they'd been charged by mistake. The first <VentureLink id="already-loved">Already Loved</VentureLink>
          book sold to a family in Australia about a month ago.
          <b> Twenty-five years</b> coding, and that moment still wrecks me.
        </p>
        <p>
          The hardest part of building isn't building. It's saying <em>no</em> to
          many, many compelling ideas. My idea-to-shipped-product rate is high enough
          that, left unchecked, I will start six things at once. I'm purposely throttling
          it to focus on <VentureLink id="already-loved"><b>Already Loved</b></VentureLink> with my wife.
        </p>
        <p>
          I was a product manager through 2022 — at <VentureLink id="buffer">Buffer</VentureLink>, at{' '}
          <VentureLink id="ensurall">Ensurall</VentureLink>, across founder work. Since AI became my
          co-builder, I&apos;m a <b>product shipper</b>: see something that needs to exist, learn what you
          don&apos;t know, ship it. My own things — <VentureLink id="songsuggest"><b>SongSuggest</b></VentureLink> (sold),{' '}
          <VentureLink id="quickstaff"><b>Quickstaff</b></VentureLink> (sold 2022), <VentureLink id="overflow"><b> The Overflow</b></VentureLink>{' '}
          (co-founded, wound down), <VentureLink id="cowriter">Cowriter</VentureLink>, my{' '}
          <VentureLink id="personal-agent">Personal Agent</VentureLink>, and now <VentureLink id="already-loved"><b> Already Loved</b></VentureLink>.
          Other people&apos;s — Buffer&apos;s freemium growth, <VentureLink id="maverick-city">Maverick City</VentureLink>&apos;s
          digital ecosystem, the warranty portals at Ensurall.
        </p>
        <p>
          Right now my day job is <b>product shipper</b> at <VentureLink id="ensurall">Ensurall + GVC</VentureLink>.
          I love the team, the autonomy, and the cadence — <b>two to three micro-projects a week</b>
          on a Salesforce stack. But in the end, we sell car warranties. I'd love to
          spend my days helping <em>founders</em> build autonomous companies — powered and
          informed by <VentureLink id="posthog">PostHog</VentureLink>.
        </p>
        <p>
          What I'm most looking forward to at <VentureLink id="posthog">PostHog</VentureLink>: <b>PostHog Code</b>, and the chance to
          help run an <em>autonomous company</em>. I'm already trying to build <VentureLink id="already-loved">Already Loved</VentureLink>
          into one. I'd love to do that on rails you've already laid.
        </p>
        <p>
          I'm not pitching the future of autonomous companies. <em>I'm reporting from inside one.</em>
        </p>
      </div>

      <div className="readme-quickjumps">
        <span className="rq-label">jump to</span>
        <UseTabLink to="timeline">→ builder timeline</UseTabLink>
        <UseTabLink to="exp">→ experiment scoreboard</UseTabLink>
        <UseTabLink to="values">→ values in practice</UseTabLink>
        <UseTabLink to="building">→ currently building</UseTabLink>
        <UseTabLink to="live">→ live posthog loop</UseTabLink>
      </div>

      <ReadmePress />

      <div className="readme-tags">
        <span>founder × 5</span>
        <span>2 exits</span>
        <span>led product × 3</span>
        <span>330k users reached</span>
        <span>$5M+/yr influenced</span>
        <span>2–3 micro-projects / wk</span>
      </div>
    </div>
    {venture && ventureState && (
      <VenturePopover
        venture={venture}
        onClose={ventureCtx.close}
        onCancelClose={ventureCtx.cancelClose}
      />
    )}
    </VentureCtx.Provider>
  );
}

function UseTabLink({ to, children }) {
  const app = useApp();
  return (
    <button className="rq-link" onClick={() => app.setTab(to)}>{children}</button>
  );
}

function ReadmePress() {
  if (!PRESS_MENTIONS.length) return null;
  return (
    <section className="readme-press" aria-label="Press and features">
      <div className="readme-press-label">in the press</div>
      <ul className="readme-press-list">
        {PRESS_MENTIONS.map((item) => (
          <li key={item.id}>
            <a
              className="readme-press-item"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                capturePh('press_mention_click', { id: item.id });
                captureOutbound(item.url, 'press_mention', { id: item.id });
              }}
            >
              <span className="readme-press-outlet">{item.outlet} · {item.series}</span>
              <span className="readme-press-title">{item.title}</span>
              <span className="readme-press-meta">{item.date} · {item.excerpt}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─── Section shell ─── */
function Section({ num, title, sub, children }) {
  return (
    <section className="section">
      <div className="section-head">
        <span className="num">§{num}</span>
        <h2>{title}</h2>
        <span className="sub">{sub}</span>
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}

/* ─── Hero KPIs ─── */
const KPI_DATA = [
  { id: "k_01", num: "9", unit: "", label: "Products shipped",
    meth: "4 founded · 1 co-founded · 1 agent-platform skills author · 3 led at other companies. Each launched, reached strangers, and taught me lots. A million ideas still in the chamber; I painfully say no (for now).",
    spark: "· verified · for now",
    breakdown: [
      { name: "SongSuggest · founded",     v: "2010 · sold"        },
      { name: "VCG/Ensurall · architected", v: "2010– · ongoing"      },
      { name: "The Overflow · co-founded",  v: "2013–19 · wound down" },
      { name: "Quickstaff · founded",      v: "2015 · sold 2022"   },
      { name: "Maverick City · led digital",v: "2019–23"            },
      { name: "Buffer Freemium · led PM",   v: "2022–23"           },
      { name: "Cowriter · founded",        v: "2023 · early LLM"   },
      { name: "Personal Agent · skills author", v: "2 personas · 39 skills · 260+ sales"},
      { name: "Already Loved · founded",   v: "2024– · going concern" },
    ],
    note: "nine on the board. shipped = launched + reached real users + taught me something worth keeping. the rest wait in the chamber until they earn a yes.",
  },
  { id: "k_02", num: "15", unit: "y", label: "Years building",
    meth: "Continuous from 2010 — SongSuggest at the dawn of the App Store to Already Loved today.",
    spark: "· unbroken streak",
    breakdown: [
      { name: "First production ship",  v: "2010 · SongSuggest" },
      { name: "First founder exit",     v: "2022 · Quickstaff"  },
      { name: "First LLM product",      v: "2023 · Cowriter"    },
      { name: "First AI agent product", v: "2025 · Personal Agent"    },
      { name: "Current focus",          v: "Already Loved"      },
      { name: "Day job (since 2010)",   v: "Ensurall · Product shipper" },
    ],
    note: "twenty-five years coding. fifteen of them shipping product I was on the hook for.",
  },
  { id: "k_03", num: "330", unit: "k+", label: "Users reached",
    meth: "Buffer freemium MAUs + The Overflow active users. Audience-only metrics (YouTube views) excluded on purpose.",
    spark: "· active users only",
    breakdown: [
      { name: "Buffer freemium",      v: "150,000+ MAU"  },
      { name: "The Overflow",         v: "180,000+ users" },
      { name: "Quickstaff customers", v: "~8,000 venues"  },
      { name: "Personal Agent sales", v: "260+"            },
      { name: "Already Loved",        v: "book sales · May 2026" },
      { name: "Maverick City youtube",v: "excluded (passive)" },
    ],
    note: "active users only. honest math beats big math.",
  },
  { id: "k_04", num: "2", unit: "", label: "Founder exits",
    meth: "SongSuggest (sold) and Quickstaff (bootstrapped, 4.7★ Capterra, sold 2022). Both quiet, both real.",
    spark: "· both sold",
    breakdown: [
      { name: "SongSuggest",        v: "founded 2010 · sold"  },
      { name: "Quickstaff",         v: "founded 2015 · sold 2022" },
      { name: "Bootstrapping style",v: "no VC"               },
      { name: "Quickstaff rating",  v: "4.7★ Capterra"        },
      { name: "Currently working an exit", v: "Already Loved" },
    ],
    note: "two quiet exits. compounding > splashy.",
  },
];

function KPIs() {
  const [open, setOpen] = React.useState(null);
  const opened = KPI_DATA.find(k => k.id === open);
  return (
    <>
      <div className="kpis">
        {KPI_DATA.map((k, i) => (
          <div className={`kpi k-${i+1}`}
               key={k.id}
               onClick={() => { setOpen(k.id); capturePh('kpi_clicked', { id: k.id, label: k.label }); }}
               role="button"
               tabIndex={0}>
            <div className="k-spark">{k.spark} <span className="acc">●</span></div>
            <div className="k-id">{k.id}</div>
            <div className="k-num">{k.num}<span className="unit">{k.unit}</span></div>
            <div className="k-label">{k.label}</div>
            <div className="k-meth">{k.meth}</div>
            <div className="kpi-flip-hint">click for breakdown →</div>
          </div>
        ))}
      </div>
      {opened && <KPIModal kpi={opened} onClose={() => setOpen(null)} />}
    </>
  );
}

function KPIModal({ kpi, onClose }) {
  const { pos, dragging, onDown } = useDrag();
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  return createPortal(
    <div className="kpim-back" onClick={onClose}>
      <div className={`kpim ${dragging ? 'dragging' : ''}`}
           onClick={(e) => e.stopPropagation()}
           role="dialog"
           style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
        <div className="kpim-titlebar" onMouseDown={onDown} onTouchStart={onDown}
             style={{ cursor: dragging ? 'grabbing' : 'grab' }}>
          <div className="lights">
            <span className="l1" onClick={onClose} title="close"></span>
            <span className="l2" title="minimize"></span>
            <span className="l3" title="zoom"></span>
          </div>
          <div className="kpim-title">
            {kpi.id} · {kpi.label.toLowerCase()}
            <span className="kpim-title-suffix"> · breakdown</span>
          </div>
          <button className="kpim-close" onClick={onClose}>×</button>
        </div>
        <div className="kpim-body">
          <div className="kpim-hero">
            <div className="kpim-num">{kpi.num}<span className="unit">{kpi.unit}</span></div>
            <div className="kpim-side">
              <div className="kpim-label">{kpi.label}</div>
              <div className="kpim-meth">{kpi.meth}</div>
            </div>
          </div>
          <div className="kpim-section-head">how this number is computed</div>
          <table className="kpim-table">
            <tbody>
              {kpi.breakdown.map((row, j) => (
                <tr key={j}>
                  <td>{row.name}</td>
                  <td><b>{row.v}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="kpim-note">{kpi.note}</div>
        </div>
        <div className="kpim-foot">
          <span>press <kbd>esc</kbd> or click outside to close</span>
          <button className="kpim-foot-btn" onClick={onClose}>close</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Timeline ─── */
/* Listed in reverse chronological order (most recent first, like a resume). */
const MILESTONES = [
  { year: "2024–present", yStart: 2024, title: "Already Loved",
    type: "AI-personalised identity books for children",
    impact: "Book sales launched May 2026 · 3,000+ commits in 2026 · going concern",
    tag: "FOUNDED + SHIPPING", tagClass: "tag-founded", built: true,
    ventureId: "already-loved",
    url: "https://alreadylovedkids.com",
    detail: "Founded with my wife. Not personalised stories — personalised identity formation, the vitamin every kid needs in the preschool years. The illustrated book is the spoonful of sugar that makes it go down. I fix the bugs, harden security, check the logs, write the image prompts. No co-founder, no engineering team — just me, AI, my wife, and my kids." },
  { year: "2024–present", yStart: 2024, title: "Personal Agent (OpenClaw / Hermes)",
    type: "My agent. Authors and sells Claude skills on a marketplace.",
    impact: "2 personas · 39 skills · 260+ sales · entirely agent-built and -deployed",
    tag: "AGENT SKILLS AUTHOR", tagClass: "tag-experiment", built: true,
    url: "https://www.shopclawmart.com/creators/41476833-3478-44b6-8843-062f7c70955b",
    detail: "A real experiment in what an agent-run business can do. Two personas authoring 39 skills between them, 260+ sales / downloads so far — every skill agent-built and agent-deployed. I'm reading the meters; the agent is shipping." },
  { year: "2023–present", yStart: 2023, title: "Ensurall · Product shipper",
    type: "Product shipper · independent · exclusive engagement",
    impact: "5× shipping cadence · 2–3 micro-projects/wk · Salesforce stack",
    tag: "PRODUCT SHIPPER", tagClass: "tag-founded", built: true,
    url: "https://ensurall.ca",
    detail: "Came back after Buffer because shipping beats spec-writing. I was a PM here through 2022; AI turned me into a product shipper. Now I find ideas, design them, and ship them — 2–3 micro-projects a week, mostly on Salesforce. The joy is still saying “here, I made this”." },
  { year: "2023", yStart: 2023, title: "Cowriter",
    type: "GPT-powered songwriting / lyric assistant",
    impact: "Shipped early LLM product · learned prompt engineering hands-on",
    tag: "FOUNDED", tagClass: "tag-founded", built: true,
    url: "https://www.getcowriter.com",
    detail: "Built before the LLM gold rush. Didn't get the timing right; got the muscle memory. That muscle is what's letting Already Loved exist now." },
  { year: "2022–2023", yStart: 2022, title: "Buffer · Growth",
    type: "Growth PM · led the growth team (not the product team)",
    impact: "150k+ MAU · +11% activation · $2M VAT recovered",
    tag: "LED GROWTH", tagClass: "tag-led", built: false,
    url: "https://buffer.com",
    detail: "One of 4,000 applicants who made it inside. PM on the product team, but leading growth: I owned activation + pricing migration. Loved the team. But two-week sprints + more PRDs than PRs wasn't the work I came to do. Left to go back to building." },
  { year: "2019–2023", yStart: 2019, title: "Maverick City Music",
    type: "Grammy Award-winning artists & songwriters · digital ecosystem",
    impact: "Built digital infrastructure during 10k → 2M+ YouTube growth",
    tag: "LED DIGITAL", tagClass: "tag-led", built: false,
    url: "https://maverickcitymusic.com",
    detail: "Grammy Award-winning group of artists and songwriters. The audience scaled by three orders of magnitude. I led the ecommerce, the fan tooling, the merch logistics, the writing-camp ops. The kind of work that doesn't show up on a deck but holds the whole thing up." },
  { year: "2015–2022", yStart: 2015, title: "Quickstaff",
    type: "Bootstrapped B2B SaaS · staff-scheduling marketplace",
    impact: "Profitable · 4.7★ Capterra · sold 2022",
    tag: "FOUNDED + EXITED", tagClass: "tag-founded", built: true,
    url: "https://www.quickstaffpro.com",
    detail: "Seven years compounding to a strategic exit. Every product update, every test, every deploy — I shipped it. I built the website too — hasn't changed since I sold it four years ago. Still in contact with the new owner." },
  { year: "2013–2019", yStart: 2013, title: "The Overflow",
    type: "First genre-specific music streaming platform · co-founded",
    impact: "0 → 180,000 users with no paid marketing · wound down",
    tag: "CO-FOUNDED", tagClass: "tag-founded", built: true,
    detail: "Co-founder. Catalog UX rewrite cut internal ops time 80%. Curation-as-distribution was the unlock — niche playlists travelled inside artist networks faster than ads ever could. Shut down when the angel funding ran out. The lesson stayed." },
  { year: "2010–2022", yStart: 2010, title: "Ensurall · Product Manager",
    type: "Architected B2B + B2C commerce + warranty portals · built ensurall.ca",
    impact: "$5M+/yr revenue supported · the long technical arm",
    tag: "PRODUCT MANAGER", tagClass: "tag-built", built: true,
    url: "https://ensurall.ca",
    detail: "First stint. Started architecting their commerce + warranty stack in 2010. Built ensurall.ca. Wore the PM hat over the engineering arm. Left in 2022 to try Buffer; came back in 2023 because being a quasi-founder is the work." },
  { year: "2010", yStart: 2010, title: "SongSuggest",
    type: "iPhone app · setlist tool for musicians",
    impact: "Award-winning in industry press · later sold",
    tag: "FOUNDED + EXITED", tagClass: "tag-founded", built: true,
    detail: "Two musicians, neither of us app developers, building at the dawn of the App Store. Designers in Ukraine, devs in India and Russia, us in North America. A stranger at a conference once recommended the app to me by accident — that taught me you can just do things." },
];

function Timeline() {
  const app = useApp();
  const [open, setOpen] = React.useState({ 0: true }); // Already Loved open by default
  const [coverPreview, setCoverPreview] = React.useState(null);
  const rowRefs = React.useRef({});

  React.useEffect(() => {
    if (!app) return;
    app._registerTL && app._registerTL({
      expandAll: (v) => {
        const next = {};
        if (v) MILESTONES.forEach((_, i) => { next[i] = true; });
        setOpen(next);
      },
      jumpToMilestone: (idx, flash) => {
        const el = rowRefs.current[idx];
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (flash) {
          el.classList.add('flash');
          setTimeout(() => el.classList.remove('flash'), 1400);
        }
      },
    });
  }, [app]);

  const tagFilter = app?.tagFilter || 'ALL';
  const matches = (m) => {
    switch (tagFilter) {
      case 'ALL':     return true;
      case 'BUILT':   return m.built === true;
      case 'FOUNDED': return /FOUNDED|CO-FOUNDED/.test(m.tag);
      case 'LED':     return /LED|PRODUCT MANAGER|PRODUCT SHIPPER|AI TECH FOUNDER/.test(m.tag);
      case 'EXITED':  return /EXITED/.test(m.tag);
      default:        return true;
    }
  };

  const count = MILESTONES.filter(matches).length;

  return (
    <div className="timeline">
      {coverPreview && (
        <VentureCoverLightbox
          src={coverPreview.src}
          alt={coverPreview.alt}
          onClose={() => setCoverPreview(null)}
        />
      )}
      <div className="tl-filterbar">
        <span className="fb-label">filter</span>
        <div className="tl-filters">
          {['ALL','BUILT','FOUNDED','LED','EXITED'].map((t) => (
            <button key={t} className={`tl-chip tl-chip--${t.toLowerCase()} ${tagFilter === t ? 'on' : ''}`}
                    onClick={() => app.setTagFilter(t)}>
              {t.toLowerCase()}
            </button>
          ))}
        </div>
        <span className="tl-count">showing {count} of {MILESTONES.length}</span>
        <div className="tl-actions">
          <button type="button" className="tl-action"
                  onClick={() => { const n = {}; MILESTONES.forEach((_, i) => n[i] = true); setOpen(n); }}>
            [expand all]
          </button>
          <button type="button" className="tl-action"
                  onClick={() => setOpen({})}>
            [collapse all]
          </button>
        </div>
      </div>
      <div className="tl-events">
        {MILESTONES.map((m, i) => {
          const venture = m.ventureId ? VENTURES[m.ventureId] : null;
          const showCover = Boolean(venture?.coverImage);
          return (
          <div key={i}
               ref={(el) => { rowRefs.current[i] = el; }}
               className={`tl-row ${open[i] ? 'open' : ''} ${matches(m) ? '' : 'hidden'}`}
               role="button"
               tabIndex={0}
               aria-expanded={!!open[i]}
               onClick={() => {
                 setOpen(o => {
                   const next = !o[i];
                   if (next) capturePh('milestone_expanded', { milestone: m.title, year: m.yStart });
                   return { ...o, [i]: next };
                 });
               }}
               onKeyDown={(e) => {
                 if (e.key !== 'Enter' && e.key !== ' ') return;
                 e.preventDefault();
                 setOpen(o => {
                   const next = !o[i];
                   if (next) capturePh('milestone_expanded', { milestone: m.title, year: m.yStart });
                   return { ...o, [i]: next };
                 });
               }}>
            <div className="tl-year-col">
              <b>{m.yStart}</b>
              <span>{m.year}</span>
            </div>
            <div className="tl-content">
              <div className="tl-title">
                {m.title}
                {m.url && (
                  <a className="tl-link" href={m.url} target="_blank" rel="noreferrer"
                     onClick={(e) => {
                       e.stopPropagation();
                       captureOutbound(m.url, 'timeline_milestone', { milestone: m.title });
                     }}
                     title={m.url.replace(/^https?:\/\//,'')}>↗</a>
                )}
                <span className={`pill ${m.tagClass}`}>{m.tag}</span>
                {m.built && <span className="pill tag-built-mark" title="I built this with my hands">BUILT</span>}
              </div>
              <div className="tl-type">{m.type}</div>
              <div className="tl-impact"><b>{m.impact}</b></div>
              <div className={`tl-detail${showCover ? ' tl-detail--with-cover' : ''}`}>
                {showCover && (
                  <VentureCoverThumb
                    venture={venture}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverPreview({
                        src: venture.coverImage,
                        alt: venture.coverAlt || `${venture.name} sample book cover`,
                      });
                      capturePh('timeline_cover_open', { milestone: m.title, venture: venture.id });
                    }}
                  />
                )}
                <p className="tl-detail-text">{m.detail}</p>
              </div>
            </div>
            <div className="tl-expand"><span className="tl-expand-label">expand</span></div>
          </div>
        );})}
      </div>
    </div>
  );
}

/* ─── Experiment Scoreboard ─── */
const EXPERIMENTS = [
  { id: "exp_01", name: "Buffer · onboarding redesign",
    hyp: "A re-sequenced flow lifts activation without changing acquisition.",
    stat: "+11% activation", note: "+5% MAU lift across ~150k accounts",
    learn: "Sequencing matters more than copy. The right step at the right time beat every word change we tried." },
  { id: "exp_02", name: "Buffer · VAT at checkout",
    hyp: "We can collect EU VAT without killing conversion.",
    stat: "$2M recovered", note: "no measurable conversion hit",
    learn: "Pricing changes need EU-specific copy. The fear is real; the impact is recoverable." },
  { id: "exp_03", name: "Buffer · pricing migration",
    hyp: "Self-serve migration moves users from old plans to new plans cleanly.",
    stat: "16% / $1.5M MRR", note: "migrated voluntarily, no support spike",
    learn: "Migration UX is retention work. Treat the move as the product, not a side quest." },
  { id: "exp_04", name: "Overflow · catalog UX",
    hyp: "Better internal tooling cuts ops time enough to free a hire.",
    stat: "−80% ops time", note: "freed one curator FTE",
    learn: "Internal tools have outsized ROI when the team is small enough to feel them daily." },
  { id: "exp_05", name: "Already Loved · identity vs. story bet",
    hyp: "Parents will buy a personalised identity book, not just a personalised story.",
    stat: "First paying users", note: "beta → revenue in <2 weeks",
    learn: "There are plenty of personalised story books. None whose purpose is identity formation. The bet is paying out." },
  { id: "exp_06", name: "Ensurall / GVC · ship-with-AI cadence",
    hyp: "AI-assisted dev raises my shipping rate without dropping quality.",
    stat: "5× cadence", note: "2–3 micro-projects/wk · Salesforce stack",
    learn: "The autonomous company is here in pieces. I'm reporting from inside one." },
  { id: "exp_07", name: "Personal Agent (OpenClaw / Hermes) · autonomous ship",
    hyp: "An AI agent can publish real product to a real marketplace and earn money.",
    stat: "260+ sales · $99", note: "agent built it, agent shipped it",
    learn: "Tiny number, real result. The agent did the work end-to-end; sales followed the install." },
];

function Experiments() {
  return (
    <div className="exp-wrap">
      <table className="exp-table">
        <thead>
          <tr>
            <th>Experiment</th>
            <th>Hypothesis</th>
            <th>Outcome</th>
            <th>Learning</th>
          </tr>
        </thead>
        <tbody>
          {EXPERIMENTS.map((e) => (
            <tr key={e.id}>
              <td className="exp-name">
                <span className="exp-id">{e.id}</span>
                {e.name}
              </td>
              <td className="exp-hyp" data-label="Hypothesis">{e.hyp}</td>
              <td className="exp-out" data-label="Outcome">
                <span className="out-stat"><span className="result-dot"></span>{e.stat}</span>
                <span className="out-note">{e.note}</span>
              </td>
              <td className="exp-learn" data-label="Learning">{e.learn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Values component ─── */
function Values() {
  const [openIdx, setOpenIdx] = React.useState(0);

  return (
    <div className="values-layout">
      <figure className="values-photo">
        <img
          src="/posthog/values-posthog-shirt.png"
          alt="Batsirai pointing at the PostHog logo on his shirt"
          width={560}
          height={700}
          loading="lazy"
        />
        <figcaption className="values-photo-cap">
          Best swag kit I got for being a posthog org!!! T-shirt is awesome quality btw.
        </figcaption>
      </figure>

      <div className="values-acc">
      {VALUES.map((v, i) => (
        <article key={v.id} className={`value-card ${openIdx === i ? 'open' : ''}`}>
            <header
              className="value-head"
              onClick={() => setOpenIdx(i)}
              role="button"
              tabIndex={0}
              aria-expanded={openIdx === i}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenIdx(i);
                }
              }}
            >
              <div className="value-num">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="value-label">{v.label}</h3>
              <span className="value-toggle">{openIdx === i ? '−' : '+'}</span>
            </header>
          <div className="value-body">
            <blockquote className="value-pull">&ldquo;{v.pull}&rdquo;</blockquote>
            {v.paragraphs.map((p, j) => <p key={j}>{p}</p>)}
          </div>
        </article>
      ))}
      </div>
    </div>
  );
}

/* ─── Active builds (above commits in Building tab) ─── */
const GITHUB_URL = 'https://github.com/Batsirai';

function BuilderCred() {
  const imgSrc = `${import.meta.env.BASE_URL}building/github-contributions.png`;
  return (
    <section className="builder-cred" aria-label="GitHub activity">
      <a
        className="builder-cred-shot"
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="View Batsirai on GitHub — 5,270 contributions in the last year">
        <img src={imgSrc} alt="GitHub contribution graph — 5,270 contributions in the last year" loading="lazy" decoding="async" />
      </a>
      <a className="builder-cred-link" href={GITHUB_URL} target="_blank" rel="noreferrer">
        github.com/Batsirai →
      </a>
    </section>
  );
}

function ActiveBuilds() {
  return (
    <div className="ab-grid">
      {ACTIVE_BUILDS.map((b, i) => (
        <a key={i} className="ab-card" href={b.url} target={b.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          <div className="ab-head">
            <span className="ab-name">{b.name}</span>
            <span className={`ab-status status-${b.status.replace(/[^a-z]/g,'-')}`}>{b.status}</span>
          </div>
          <p className="ab-desc">{b.desc}</p>
          {b.commits2026 && <div className="ab-meta">↳ {b.commits2026}</div>}
        </a>
      ))}
    </div>
  );
}
const COMMITS = [
  { sha: "a3f9c12", repo: "already-loved/web", msg: "fix: hardcode story-length cap for under-3s", time: "12m", files: "+18 −4" },
  { sha: "8e1b074", repo: "already-loved/render-pipeline", msg: "perf: cache illustrator prompts per character", time: "2h", files: "+92 −31" },
  { sha: "21caf83", repo: "already-loved/web", msg: "feat(checkout): paypal alt-flow for non-NA cards", time: "5h", files: "+204 −12" },
  { sha: "ef07a55", repo: "batsirai/batsirai-os", msg: "wip: posthog application profile v0.3", time: "9h", files: "+612 −0" },
  { sha: "d4c1290", repo: "already-loved/render-pipeline", msg: "chore: bump model + rerun eval, identity scores up", time: "1d", files: "+6 −6" },
  { sha: "7a98ee2", repo: "already-loved/web", msg: "fix: stripe webhook idempotency on book.completed", time: "2d", files: "+34 −2" },
  { sha: "11b3fa1", repo: "batsirai/grandstorybook", msg: "spike: voice-first grandparent capture flow", time: "3d", files: "+158 −0" },
  { sha: "5fcc8d0", repo: "already-loved/web", msg: "feat: gift-flow — send book to email on date", time: "4d", files: "+158 −7" },
  { sha: "c39ab17", repo: "batsirai/personal-agent", msg: "feat: agent self-publishes skill v0.4 to marketplace", time: "5d", files: "+92 −18" },
  { sha: "2bd0e84", repo: "batsirai/more-christlike", msg: "data: trinitarian knowledge-graph nodes batch 7", time: "6d", files: "+411 −0" },
];

/* ─── Active builds (above the commits) ─── */
const ACTIVE_BUILDS = [
  { name: "Already Loved", url: "https://alreadylovedkids.com",
    desc: "AI-personalised identity books for preschoolers. Founded with my wife.",
    status: "live", commits2026: "3,000+ commits in 2026" },
  { name: "Personal Agent", url: "https://www.shopclawmart.com/creators/41476833-3478-44b6-8843-062f7c70955b",
    desc: "My agent (OpenClaw / Hermes), authors and sells Claude skills. Two personas, 39 skills, 260+ sales — entirely agent-built and -deployed.",
    status: "live", commits2026: "experiment: can an agent run a business?" },
  { name: "Grandstorybook", url: "#",
    desc: "Voice-first AI for grandparents — capture a story, turn it into a kid's book.",
    status: "private alpha", commits2026: null },
  { name: "Carson", url: "#",
    desc: "My AI chief of staff, built on top of Hermes. Runs Already Loved in market with me — the marketing content factory, the bug triage, the daily ops.",
    status: "live", commits2026: "toward an autonomous company" },
  { name: "Adoro Studios", url: "https://adorostudios.com",
    desc: "Holding co for SongSuggest, Quickstaff, Already Loved. The vehicle.",
    status: "live", commits2026: null },
];

/* ─── PostHog values, with stories ─── */
const VALUES = [
  { id: "driver", label: "You're the driver",
    pull: "I've spent fifteen years in the driver's seat.",
    paragraphs: [
      "At Quickstaff I was the primary shipper — every product update, every design, every test, every deploy, every release. Often I didn't actually know how to do what needed doing; I'd learn it from YouTube and have it in Vue.js by end of day.",
      "With Already Loved it's the same shape, just current. I fix the bugs, harden the security, check the logs for incidents, manage the product, write the image prompts. No co-founder, no engineering team — just me, AI, my wife, and my kids.",
      "In 2026 alone I've shipped over 3,000 commits to Already Loved. It exists, it's out there, it's delivering value to families I'll never meet. That's the driver's seat.",
    ] },
  { id: "public", label: "Make it public",
    pull: "I default to public because I learned what it costs not to.",
    paragraphs: [
      "Long before I wrote a newsletter or shipped a product in public, my wife and I made a choice that taught me what transparency actually costs and gives back.",
      "We were dating in Bible college when she got pregnant. The dean offered us a choice: keep it private, or stand in front of the school and tell them. We told them.",
      "We weren't pelted with tomatoes. We were surrounded with love.",
      "I walked into the cafeteria that day with the weight off my shoulders for the first time in months. I learned that secrecy is a prison, and that going public — even at real risk of rejection — was the door out.",
      "He's grown now. The book we make for other parents, Already Loved, came directly from a question he might one day ask: was I wanted? We wrote it to answer that question for every child, regardless of how they came in.",
    ] },
  { id: "weird", label: "Do more weird",
    pull: "The bet looks weird from outside. Parents are saying yes.",
    paragraphs: [
      "When AI image generation took off, the obvious play in children's publishing was personalised AI storybooks — that's what everyone went for. I made a different bet.",
      "Already Loved doesn't make stories. We make personalised identity books — books written to a specific child, designed to instill strong, healthy identity in the preschool years when so much of how a child sees themselves is being set.",
      "Parents are used to buying stories. Why aren't you doing stories? But the actual job is delivering the vitamin of a beloved identity to a small child. The personalised illustrated book is the spoonful of sugar that makes it go down.",
      "There are plenty of personalised children's books on the market. I haven't yet found one whose purpose is identity formation itself. That's the bet.",
    ] },
  { id: "whynot", label: "Why not now?",
    pull: "Why not now? is the only setting I have.",
    paragraphs: [
      "I was one of 4,000 applicants who made it all the way into Buffer. I loved the team. But once inside, I realised the shape of the work — two-week sprints, shipping a few times a month, more PRDs and reports than pull requests — wasn't the work I'd come to do.",
      "So I left and went back to Ensurall, where I'd already been the technical arm for over a decade and where I could actually build.",
      "Two weeks ago my VP of Sales started running through new ideas — \"we could build this, we could do that\" — and I felt the whole day light up. That's the work.",
      "I ship straight to production to get changes in front of internal users by lunch. Two-week sprints now feel like waiting-room music.",
    ] },
  { id: "optimistic", label: "Optimistic by default",
    pull: "Sometimes a stranger hands your own product back to you as a gift.",
    paragraphs: [
      "Back when the App Store had just launched in 2010, a friend and I — both musicians, both in tech, neither of us app developers — decided to build an app that would suggest songs for musicians trying to assemble a setlist. We had no business building an app. The field was barely older than the idea.",
      "We pulled together designers in Ukraine, developers in India and Russia, and ourselves in North America. We made it. It won awards in the industry press.",
      "One day at a songwriting conference, the man sitting next to me at lunch leaned over and showed me his phone. \"You've got to check out this app.\" It was the one we'd made.",
      "I assumed he must know I was the maker. He didn't. He was just genuinely recommending our app to me, the maker of it, by accident.",
      "That's the moment that taught me you can just do things. Build the thing. Ship it. Sometimes a stranger at a conference will hand it back to you as a gift, and you'll realise the only thing between an idea and a thing in the world was the optimism to start.",
    ] },
];
function Commits() {
  return (
    <div className="commits">
      <div className="c-head">
        <span className="c-prompt">batsirai@os ~ $</span>
        <span className="c-cmd">git log --author=batsirai --since='30 days' --oneline</span>
        <span className="c-meta">8 commits · fetched from github · cached 1h</span>
      </div>
      {COMMITS.map((c, i) => (
        <div className="commit" key={i}>
          <span className="c-sha">{c.sha}</span>
          <span className="c-msg">
            <span className="c-repo">{c.repo}</span>
            {c.msg}
            <span className="c-files">{c.files}</span>
          </span>
          <span className="c-time">{c.time} ago</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Live PostHog Loop ─── */
const BAT_TZ = "America/Toronto"; // Eastern Time (ET)

function offsetKey(tz, date = new Date()) {
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "longOffset",
  })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName");
  return part?.value ?? tz;
}

function formatClockTime(date, timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

function formatTzShort(date, timeZone) {
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName");
  return part?.value ?? timeZone.split("/").pop().replace(/_/g, " ");
}

function formatPlace(tz) {
  return tz.split("/").pop().replace(/_/g, " ").toLowerCase();
}

function LiveClockStrip() {
  const [now, setNow] = React.useState(() => new Date());
  const visitorTz = React.useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const sameZone = offsetKey(BAT_TZ, now) === offsetKey(visitorTz, now);

  return (
    <div className="live-clocks" aria-live="polite">
      <span className="live-dot" aria-hidden="true" />
      <span className="live-clocks-label">now</span>
      <span className="live-clocks-time">
        {formatClockTime(now, BAT_TZ)}{" "}
        <abbr title={BAT_TZ}>{formatTzShort(now, BAT_TZ)}</abbr>
      </span>
      <span className="live-clocks-who">batsirai · eastern</span>
      {sameZone ? (
        <span className="live-clocks-same">· you&apos;re in eastern too</span>
      ) : (
        <>
          <span className="live-clocks-sep" aria-hidden="true">
            ·
          </span>
          <span className="live-clocks-time">
            {formatClockTime(now, visitorTz)}{" "}
            <abbr title={visitorTz}>{formatTzShort(now, visitorTz)}</abbr>
          </span>
          <span className="live-clocks-who">you · {formatPlace(visitorTz)}</span>
        </>
      )}
    </div>
  );
}

function Sparkline({ data, color }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const w = 100, h = 36;
  const pts = data.map((d, i) =>
    `${(i/(data.length-1))*w},${h - ((d-min)/range)*(h-4) - 2}`
  ).join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polygon points={area} fill={color} opacity="0.18" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ─── Phase 3 — PostHog showcase widgets ─── */
const PH_DASHBOARD_URL = 'https://us.posthog.com/project/436808/dashboard/1620520';
const PH_REPLAY_BASE = 'https://us.posthog.com/project/436808/replay/';

/** Custom events advertised on the Live tab — keep in sync with capture() calls below. */
const LIVE_CUSTOM_EVENTS = [
  'kpi_clicked',
  'milestone_expanded',
  'survey_responded',
  'live_widget_loaded',
  'survey_shown',
  'first_experience_strip_shown',
  'first_experience_book_chat_click',
  'first_experience_explore_primary',
  'first_experience_explore_timeline',
  'first_experience_explore_building',
  'first_experience_explore_experiments',
  'first_experience_explore_live',
  'first_experience_explore_cmdk',
];

const captureOnceKeys = new Set();
function capturePh(event, properties) {
  window.posthog?.capture(event, properties);
}
function capturePhOnce(event, properties) {
  if (captureOnceKeys.has(event)) return;
  captureOnceKeys.add(event);
  capturePh(event, properties);
}
function captureOutbound(url, label, extra) {
  capturePh('outbound_link_clicked', { url, label, ...extra });
}

function usePhStats() {
  const [s, setS] = React.useState(null);
  React.useEffect(() => {
    let dead = false;
    async function load() {
      try {
        const r = await fetch('/posthog/api/stats');
        if (!r.ok) return;
        const j = await r.json();
        if (!dead && j && j.status === 'ok') setS(j);
      } catch {}
    }
    load();
    const id = setInterval(load, 30000);
    return () => { dead = true; clearInterval(id); };
  }, []);
  return s;
}

function flagOf(cc) {
  if (!cc || cc.length !== 2) return '🌐';
  const A = 0x1F1E6;
  return String.fromCodePoint(A + cc.charCodeAt(0) - 65) +
         String.fromCodePoint(A + cc.charCodeAt(1) - 65);
}

function fmtK(n) {
  if (n == null) return null;
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
}

function humanizeEvent(e) {
  switch (e) {
    case '$pageview':           return 'opened the dashboard';
    case 'kpi_clicked':         return 'opened a KPI breakdown';
    case 'milestone_expanded':  return 'expanded a timeline milestone';
    case 'survey_responded':    return 'answered the in-page survey';
    case 'survey_shown':        return 'reached the survey card';
    case 'live_widget_loaded':  return 'opened the live tab';
    case 'survey sent':         return 'submitted the popover survey';
    case 'survey shown':        return 'saw the popover survey';
    case '$feature_flag_called': return 'got a feature flag';
    case '$rageclick':          return 'rage-clicked something';
    default:                    return e.replace(/_/g, ' ');
  }
}

function usePostHogIds() {
  const [ids, setIds] = React.useState(null);
  React.useEffect(() => {
    const read = () => {
      const ph = window.posthog;
      if (!ph?.get_session_id) return;
      try {
        const sid = ph.get_session_id();
        const did = ph.get_distinct_id?.() || null;
        if (sid) setIds({ sid, did });
      } catch {}
    };
    read();
    const id = setInterval(read, 1500);
    return () => clearInterval(id);
  }, []);
  return ids;
}

function shortPhId(s) {
  if (!s) return '';
  return s.length > 14 ? s.slice(0, 8) + '…' + s.slice(-4) : s;
}

function useFromPostHog() {
  return React.useMemo(() => {
    try {
      const ref = document.referrer || '';
      const params = new URLSearchParams(window.location.search);
      return /posthog\.com/i.test(ref)
        || params.get('utm_source') === 'posthog'
        || params.get('from') === 'posthog';
    } catch {
      return false;
    }
  }, []);
}

function FirstExperienceStrip() {
  const app = useApp();
  const fromPh = useFromPostHog();
  const [collapsed, setCollapsed] = React.useState(() => {
    try { return sessionStorage.getItem(FIRST_EXP_COLLAPSED_KEY) === '1'; } catch { return false; }
  });

  React.useEffect(() => {
    capturePhOnce('first_experience_strip_shown', { from_posthog: fromPh });
  }, [fromPh]);

  const dismiss = () => {
    setCollapsed(true);
    try { sessionStorage.setItem(FIRST_EXP_COLLAPSED_KEY, '1'); } catch {}
    capturePh('first_experience_strip_dismissed');
  };
  const expand = () => {
    setCollapsed(false);
    try { sessionStorage.removeItem(FIRST_EXP_COLLAPSED_KEY); } catch {}
    capturePh('first_experience_strip_expanded');
  };

  if (collapsed) {
    return (
      <button type="button" className="first-exp first-exp--collapsed" onClick={expand}>
        <span className="first-exp-kicker">for PostHog</span>
        <span className="first-exp-collapsed-text">Explore the app · then let&apos;s talk</span>
        <span className="first-exp-collapsed-cta">expand</span>
      </button>
    );
  }

  const roleLink = (
    <a
      className="first-exp-role-link"
      href={POSTHOG_EX_FOUNDER_ROLE_URL}
      target="_blank"
      rel="noreferrer"
      onClick={() => capturePh('first_experience_role_link_click', { role: 'technical_ex_founder' })}
    >
      Technical Ex-Founder
    </a>
  );
  const copy = fromPh ? (
    <>
      I made this for you — built to use, not read. Wander the tabs, ventures, themes, and Live
      surface. If it feels like someone you want on the team, let&apos;s talk.
    </>
  ) : (
    <>
      Built to use, not read. Explore the tabs, poke the Easter eggs, see how it feels. If it
      resonates, I&apos;m hoping we can talk.
    </>
  );

  const goExplore = (target, eventName, extra) => {
    if (target === 'cmdk') app.openPalette('first_experience');
    else app.setTab(target);
    capturePh(eventName, extra);
  };

  return (
    <div className="first-exp" role="region" aria-label="Note to PostHog reviewers">
      <p className="first-exp-moustache">what is this?</p>
      <div className="first-exp-answer-row">
        <p className="first-exp-mission">
          An application to join or lead a small team at PostHog.
        </p>
        <button type="button" className="first-exp-dismiss" onClick={dismiss} aria-label="Collapse">
          ×
        </button>
      </div>
      <p className="first-exp-roles">
        {roleLink} · or any product manager role
      </p>
      <p className="first-exp-copy">{copy}</p>
      <div className="first-exp-explore-label">Start anywhere</div>
      <div className="first-exp-explore">
        <button type="button" className="first-exp-chip" onClick={() => goExplore('timeline', 'first_experience_explore_timeline')}>
          Timeline
        </button>
        <button type="button" className="first-exp-chip" onClick={() => goExplore('building', 'first_experience_explore_building')}>
          Building
        </button>
        <button type="button" className="first-exp-chip" onClick={() => goExplore('exp', 'first_experience_explore_experiments')}>
          Experiments
        </button>
        <button type="button" className="first-exp-chip" onClick={() => goExplore('live', 'first_experience_explore_live')}>
          Live
        </button>
        <button type="button" className="first-exp-chip first-exp-chip--cmdk" onClick={() => goExplore('cmdk', 'first_experience_explore_cmdk')}>
          ⌘K extras
        </button>
      </div>
      <div className="first-exp-actions">
        <button
          type="button"
          className="first-exp-primary"
          onClick={() => goExplore('building', 'first_experience_explore_primary')}
        >
          Explore the app →
        </button>
        <a
          className="first-exp-secondary first-exp-secondary--link"
          href={BOOK_CHAT_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => capturePh('first_experience_book_chat_click')}
        >
          Book a chat when you&apos;re ready →
        </a>
      </div>
    </div>
  );
}

function ProfileApplicationHint() {
  const app = useApp();
  return (
    <button
      type="button"
      className="ps-app-hint"
      onClick={() => {
        app.setTab('building');
        capturePh('profile_application_hint_click');
      }}
    >
      Built for PostHog · explore the tabs, then say hi →
    </button>
  );
}

function YourSession() {
  const ids = usePostHogIds();
  const [geo, setGeo] = React.useState(null);
  const [clock, setClock] = React.useState('');

  React.useEffect(() => {
    let dead = false;
    fetch('/posthog/api/whereami')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!dead && j) setGeo(j); })
      .catch(() => {});
    return () => { dead = true; };
  }, []);

  React.useEffect(() => {
    const tick = () => {
      const tz = geo?.timezone;
      try {
        setClock(new Date().toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit', hour12: false,
          ...(tz ? { timeZone: tz } : {}),
        }));
      } catch {
        setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      }
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, [geo?.timezone]);

  if (!ids) return null;

  const replayUrl = `${PH_REPLAY_BASE}${ids.sid}`;
  const short = shortPhId;
  const place = geo
    ? [geo.city, geo.region || geo.country].filter(Boolean).join(', ')
    : null;
  const browserTz = (() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
    catch { return null; }
  })();

  return (
    <div className="ph-card ph-session">
      <div className="ph-card-head">
        <span><span className="live-dot"></span> your session — being recorded</span>
        <a className="ph-link" href={replayUrl} target="_blank" rel="noreferrer"
           onClick={() => captureOutbound(replayUrl, 'session_replay')}>
          watch yourself in PostHog ↗
        </a>
      </div>
      {(place || browserTz) && (
        <div className="ph-whereami">
          <span className="ph-where-flag">{geo?.country ? flagOf(geo.country) : '🌐'}</span>
          <span>
            PostHog sees you in <b>{place || 'an unknown city'}</b>
            {clock && <> right now · <b>{clock}</b> your time</>}
            {geo?.timezone && <> · <span className="ph-mono-inline">{geo.timezone}</span></>}
            <small>{' '}— that's the same GeoIP your reviewer's PostHog would have shown.</small>
          </span>
        </div>
      )}
      <div className="ph-session-grid">
        <div><div className="ph-k">session_id</div><div className="ph-mono">{short(ids.sid)}</div></div>
        <div><div className="ph-k">distinct_id</div><div className="ph-mono">{short(ids.did || '')}</div></div>
        <div><div className="ph-k">replay</div><div className="ph-mono">canvas · network · console</div></div>
      </div>
    </div>
  );
}

function FunnelOfYou() {
  const STEPS = [
    { id: 'loaded',    label: 'loaded the dashboard',     event: '$pageview' },
    { id: 'milestone', label: 'expanded a timeline milestone', event: 'milestone_expanded' },
    { id: 'kpi',       label: 'opened a KPI breakdown',   event: 'kpi_clicked' },
    { id: 'survey',    label: 'answered the survey',      event: 'survey_responded' },
  ];
  const [done, setDone] = React.useState({});
  React.useEffect(() => {
    const ph = window.posthog;
    if (!ph || typeof ph.on !== 'function') return;
    // Autocaptured pageview usually fires before this widget mounts.
    setDone(d => ({ ...d, loaded: true }));
    let off;
    try {
      off = ph.on('eventCaptured', (e) => {
        const name = e && (e.event || e.name);
        const hit = STEPS.find(s => s.event === name);
        if (hit) setDone(d => ({ ...d, [hit.id]: true }));
      });
    } catch {}
    return () => { try { off && off(); } catch {} };
  }, []);
  const n = STEPS.filter(s => done[s.id]).length;
  return (
    <div className="ph-card ph-funnel">
      <div className="ph-card-head">
        <span>funnel · you ({n}/{STEPS.length})</span>
        <span className="ph-k">live, client-side · mirrored to a PostHog insight</span>
      </div>
      <ol className="ph-funnel-list">
        {STEPS.map((s, i) => (
          <li key={s.id} className={done[s.id] ? 'on' : ''}>
            <span className="ph-tick">{done[s.id] ? '✓' : String(i+1).padStart(2,'0')}</span>
            <span className="ph-step">{s.label}</span>
            <span className="ph-evt">{s.event ? `event: ${s.event}` : ''}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PostHogPowered() {
  const stats = usePhStats();
  const items = [
    { label: 'autocapture',           meta: stats?.totalToday != null ? `${stats.totalToday.toLocaleString()} events in the last 24h` : 'every click, form, pageview' },
    { label: 'session replay',        meta: 'recording you right now · canvas + console' },
    { label: 'heatmaps',              meta: 'auto, via autocapture' },
    { label: 'surveys',               meta: '1 active · popover on /posthog · 8s delay' },
    { label: 'feature flags',         meta: 'available · theme stays PostHog until you switch' },
    { label: 'hogql via worker',      meta: 'this widget runs SQL against your PostHog' },
    { label: 'custom events',         meta: LIVE_CUSTOM_EVENTS.join(' · ') },
    { label: 'person profiles + geoip', meta: stats?.locations?.length ? `${stats.locations.length} recent cities, enriched` : 'city · country · referrer' },
    { label: 'cohort signal',         meta: stats?.highIntent != null ? `${stats.highIntent} high-intent visitors (30d) · ≥1 deep interaction` : 'high-intent: ≥1 deep interaction' },
    { label: 'saved dashboard',       meta: '3 tiles · pageviews · custom events · by country' },
  ];
  return (
    <div className="ph-card ph-powered">
      <div className="ph-card-head">
        <span>instrumented with PostHog</span>
        <a className="ph-link" href={PH_DASHBOARD_URL} target="_blank" rel="noreferrer"
           onClick={() => captureOutbound(PH_DASHBOARD_URL, 'posthog_dashboard')}>
          live PostHog dashboard ↗
        </a>
      </div>
      <ul className="ph-powered-list">
        {items.map((it, i) => (
          <li key={i}>
            <span className="ph-pow-tick">✓</span>
            <span className="ph-pow-label">{it.label}</span>
            <span className="ph-pow-meta">{it.meta}</span>
          </li>
        ))}
      </ul>
      <div className="ph-toolbar-hint">
        Reviewing this on PostHog? Add <code>batsirai.com/posthog</code> as an authorized URL in your{' '}
        <a href="https://us.posthog.com/settings/project-product-analytics" target="_blank" rel="noreferrer">project settings</a>{' '}
        and launch the toolbar to inspect any element here.
      </div>
    </div>
  );
}

function LiveLoop() {
  const stats = usePhStats();
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => { capturePhOnce('live_widget_loaded'); }, []);
  // Cosmetic tick so timestamps re-render every few seconds.
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  const sparkData = [12, 18, 14, 22, 30, 26, 33, 41, 38, 47, 52, 49, 58, 64];

  // Real recent events from PostHog → ticker rows. Falls back to a small mock
  // set when stats are pending so the layout never reads empty.
  const realEvents = (stats?.recentEvents || []).slice(0, 3).map((r) => {
    const ts = new Date(r.ts).getTime();
    const ago = Math.max(1, Math.round((Date.now() - ts) / 1000));
    const when = ago < 60 ? `${ago}s` : ago < 3600 ? `${Math.round(ago/60)}m` : `${Math.round(ago/3600)}h`;
    const where = r.city ? `Someone in ${r.city}` : 'Someone';
    return { who: where, what: humanizeEvent(r.e), when };
  });
  const fallbackEvents = [
    { who: 'Someone in Berlin', what: 'expanded the Buffer milestone', when: '2s' },
    { who: 'Someone in San Francisco', what: 'opened a KPI breakdown', when: '14s' },
    { who: 'Someone in Cambridge, UK', what: 'loaded the dashboard', when: '31s' },
  ];
  const tickerEvents = realEvents.length ? realEvents : fallbackEvents;

  return (
    <div className="live-grid">
      <div>
        <div className="lv-head"><span className="live-dot"></span> live · last 5 min</div>
        <div className="lv-num signal">{stats?.live ?? '—'}</div>
        <div className="lv-sub">visitors active right now</div>
        <div className="lv-spark">
          <Sparkline data={sparkData} color="#B8442D" />
        </div>
        <div className="lv-sub">this week · {stats?.weekUnique ?? '—'} unique · {fmtK(stats?.weekEvents) ?? '—'} events</div>
        <div className="lv-events">
          {tickerEvents.map((e, i) => (
            <div className="lv-event" key={e.who + e.what + i + tick}>
              <span className="lv-when">{e.when}</span>
              <span><b>{e.who}</b> {e.what}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="lv-head">top referrers · this week</div>
        <ul className="lv-refs">
          {(() => {
            const refs = stats?.referrers?.length ? stats.referrers : [
              { host: 'posthog.com', count: 38 },
              { host: 'linkedin.com', count: 27 },
              { host: 'direct', count: 20 },
              { host: 'news.ycombinator', count: 9 },
              { host: 'twitter.com', count: 6 },
            ];
            const total = refs.reduce((s, r) => s + r.count, 0) || 1;
            const max = Math.max(...refs.map(r => r.count));
            return refs.map((r, i) => {
              const pct = Math.round((r.count / total) * 100);
              const w = Math.max(8, Math.round((r.count / max) * 100));
              return (
                <li key={r.host + i}>
                  <span>{r.host}</span>
                  <span className="ref-bar"><i style={{ width: w + '%' }}></i></span>
                  <span>{pct}%</span>
                </li>
              );
            });
          })()}
        </ul>
      </div>
      <div>
        <div className="lv-head">recent locations</div>
        <div className="lv-cities">
          {(stats?.locations?.length ? stats.locations : [
            { country: 'GB', city: 'cambridge' },
            { country: 'US', city: 'san francisco' },
            { country: 'DE', city: 'berlin' },
            { country: 'ZA', city: 'cape town' },
            { country: 'GB', city: 'london' },
            { country: 'US', city: 'brooklyn' },
            { country: 'NL', city: 'amsterdam' },
            { country: 'CA', city: 'toronto' },
            { country: 'IE', city: 'dublin' },
            { country: 'AU', city: 'melbourne' },
          ]).slice(0, 12).map((l, i) => (
            <span key={i}>{flagOf(l.country)} {(l.city || '').toLowerCase()}</span>
          ))}
        </div>
        <div className="lv-head" style={{marginTop: 22}}>scroll depth · this page</div>
        <ul className="lv-refs">
          <li><span>25%</span><span className="ref-bar"><i style={{width: '94%'}}></i></span><span>94%</span></li>
          <li><span>50%</span><span className="ref-bar"><i style={{width: '71%'}}></i></span><span>71%</span></li>
          <li><span>75%</span><span className="ref-bar"><i style={{width: '52%'}}></i></span><span>52%</span></li>
          <li><span>100%</span><span className="ref-bar"><i style={{width: '34%'}}></i></span><span>34%</span></li>
        </ul>
      </div>
    </div>
  );
}

function Survey() {
  const stats = usePhStats();
  const [picked, setPicked] = React.useState(null);
  React.useEffect(() => { capturePhOnce('survey_shown'); }, []);

  // Real tally from PostHog (in-page survey_responded + native popover responses).
  // Fall back to representative numbers until first responses land.
  const fallback = [
    { answer: 'Yes', count: 31 },
    { answer: 'No', count: 22 },
    { answer: 'Honestly weirder', count: 47 },
  ];
  const raw = stats?.surveyTally?.filter((r) => r.answer && r.answer !== 'null') ?? [];
  const tallyRows = raw.length ? raw : fallback;
  const total = tallyRows.reduce((s, r) => s + r.count, 0) || 1;

  return (
    <div className="survey">
      <div className="survey-q">
        <small>
          survey · live
          {!stats?.surveyTally?.length && (
            <>
              <span className="survey-q-note survey-q-note--full"> · representative numbers until first responses land</span>
              <span className="survey-q-note survey-q-note--short"> · sample data</span>
            </>
          )}
        </small>
        Was this more useful than a resume?
      </div>
      <div className="survey-opts">
        {["Yes", "No", "Honestly weirder"].map((o) => (
          <button
            key={o}
            className={picked === o ? 'picked' : ''}
            onClick={() => { setPicked(o); capturePh('survey_responded', { answer: o }); }}>
            {o}
          </button>
        ))}
      </div>
      {picked && (
        <div className="survey-tally">
          <div className="survey-tally-meta">
            <span>logged · thanks</span>
            <span>aggregate so far →</span>
          </div>
          <div className="survey-tally-rows">
            {tallyRows.map((row) => {
              const pct = Math.round((row.count / total) * 100);
              return (
                <div className="survey-tally-row" key={row.answer}>
                  <span className="survey-tally-label">{row.answer.toLowerCase()}</span>
                  <span className="bar"><i style={{ width: pct + '%' }}></i></span>
                  <span className="survey-tally-pct">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Music tab ─── */
function SunoEmbed({ id, title }) {
  return (
    <div className="music-embed">
      <iframe
        src={`https://suno.com/embed/${id}`}
        width="100%"
        height="240"
        frameBorder="0"
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}>
        <a href={`https://suno.com/song/${id}`}>Listen on Suno</a>
      </iframe>
    </div>
  );
}

function GalleryGrid({ items, onOpen }) {
  return (
    <div className="gallery-grid">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`gallery-cell${item.span === 2 ? ' gallery-cell--wide' : ''}`}
          onClick={() => onOpen(item)}
          aria-label={`View ${item.title}`}>
          <img src={item.src} alt="" loading="lazy" decoding="async" />
          <span className="gallery-cell-cap">
            <span className="gallery-cell-title">{item.title}</span>
            <span className="gallery-cell-year">{item.year}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function GalleryLightbox({ item, onClose }) {
  if (!item) return null;
  return createPortal(
    <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={item.title}>
      <button type="button" className="gallery-lightbox-backdrop" onClick={onClose} aria-label="Close" />
      <figure className="gallery-lightbox-fig">
        <img src={item.src} alt={item.title} />
        <figcaption>
          <span>{item.title}</span>
          <span className="gallery-lightbox-year">{item.year}</span>
        </figcaption>
        <button type="button" className="gallery-lightbox-close" onClick={onClose} aria-label="Close">×</button>
      </figure>
    </div>,
    document.body,
  );
}

function Gallery() {
  const [filter, setFilter] = React.useState('all');
  const [lightbox, setLightbox] = React.useState(null);

  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox]);

  const groupMatches = (group) =>
    filter === 'all' || (group.tags && group.tags.includes(filter));

  const visibleGroups = GALLERY_GROUPS.filter(
    (g) => groupMatches(g) && GALLERY_ITEMS.some((i) => i.group === g.id),
  ).sort(compareGalleryGroups);

  return (
    <div className="gallery">
      <p className="gallery-lede">
        Every product interface here is work I designed and shipped myself — UI I owned
        end to end. Buffer off-site photos are team culture; the rest is product.
      </p>

      <div className="gallery-filters" role="tablist" aria-label="Gallery filters">
        {GALLERY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`gallery-filter${filter === f.id ? ' on' : ''}`}
            onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {visibleGroups.map((group) => {
        const items = GALLERY_ITEMS.filter((i) => i.group === group.id);
        if (!items.length) return null;
        return (
          <section key={group.id} className="gallery-section" aria-labelledby={`gallery-${group.id}`}>
            <div className="gallery-section-head">
              <div className="gallery-section-meta">
                <h3 className="gallery-section-title" id={`gallery-${group.id}`}>{group.label}</h3>
                <span className="gallery-section-era">{group.era}</span>
              </div>
              <p className="gallery-section-desc">{group.blurb}</p>
            </div>
            <GalleryGrid items={items} onOpen={setLightbox} />
          </section>
        );
      })}

      <GalleryLightbox item={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

function Music() {
  return (
    <div className="music">
      <p className="music-lede">
        Musician, twenty-plus years in. Music is the
        thing that taught me to ship: the only way to know if a song works is
        to play it for someone.
      </p>

      <section className="music-section" aria-labelledby="music-suno-heading">
        <div className="music-section-head">
          <h3 className="music-section-title" id="music-suno-heading">AI music · Suno</h3>
          <p className="music-section-desc">
            Melody, lyrics, and Suno prompt by Batsirai — voice demo to finished
            track with AI production.
          </p>
        </div>

        <div className="music-block">
          <div className="music-block-head">
            <div className="music-title">Lay Right Here</div>
            <div className="music-sub">lyrics & melody · batsirai</div>
          </div>
          <p className="music-credit">
            Lyrics and melody by me. I took it from a voice demo to this with AI
            music on Suno.
          </p>
          <SunoEmbed id="b33be6da-3f2e-4273-a377-6dffbe585f5d" title="Lay Right Here" />
        </div>

        <div className="music-block">
          <div className="music-block-head">
            <div className="music-title">Here I Made This</div>
            <div className="music-sub">lyrics & melody · batsirai</div>
          </div>
          <p className="music-credit">
            Also written by me — same pipeline: my words and tune, prompt-engineered
            into Suno.
          </p>
          <SunoEmbed id="a48701f1-404b-4c0d-b23b-65f31c95205d" title="Here I Made This" />
        </div>
      </section>

      <section className="music-section" aria-labelledby="music-live-heading">
        <div className="music-section-head">
          <h3 className="music-section-title" id="music-live-heading">
            Performed · written · recorded
          </h3>
          <p className="music-section-desc">
            Live and studio catalog — performed, written, and recorded by Batsirai.
          </p>
        </div>

        <div className="music-block">
          <div className="music-block-head">
            <div className="music-title">Batsirai · Spotify</div>
            <div className="music-sub">recorded catalog</div>
          </div>
          <div className="music-embed">
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: 0 }}
              src="https://open.spotify.com/embed/artist/4Lm4Yc59M7v0qXP77AucZD?utm_source=generator"
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Batsirai on Spotify">
            </iframe>
          </div>
        </div>

        <div className="music-block">
          <div className="music-block-head">
            <div className="music-title">Live & Studio Sessions</div>
            <div className="music-sub">youtube · playlist</div>
          </div>
          <div className="music-embed">
            <iframe
              src="https://www.youtube.com/embed/videoseries?si=DWmWrKazs_ZIWw7R&amp;list=PL597D63DE8B4003B3"
              width="100%"
              height="360"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              title="Batsirai · YouTube playlist">
            </iframe>
          </div>
        </div>
      </section>

      <p className="music-foot">
        Industry trade press awarded SongSuggest because they trusted my
        ear, not my dev skills. Same with everything else.
      </p>
    </div>
  );
}

/* ─── Mini player (floating Suno window) ─── */
function MiniPlayer({ onClose }) {
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const start = React.useRef(null);

  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - start.current.px;
      const dy = p.clientY - start.current.py;
      setPos({ x: start.current.x + dx, y: start.current.y + dy });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  const onDown = (e) => {
    if (e.target.closest('button') || e.target.closest('iframe')) return;
    const p = e.touches ? e.touches[0] : e;
    start.current = { px: p.clientX, py: p.clientY, x: pos.x, y: pos.y };
    setDragging(true);
  };

  return (
    <div className={`miniplayer ${dragging ? 'dragging' : ''}`}
         style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
      <div className="mp-bar" onMouseDown={onDown}>
        <div className="mp-lights">
          <span className="l1" onClick={onClose} title="close"></span>
          <span className="l2"></span>
          <span className="l3"></span>
        </div>
        <div className="mp-title">
          <span className="mp-eq">
            <i></i><i></i><i></i><i></i>
          </span>
          now playing — <b>lay right here</b> · batsirai
        </div>
        <button className="mp-close" onClick={onClose} title="hide">×</button>
      </div>
      <div className="mp-frame">
        <iframe
          src="https://suno.com/embed/b33be6da-3f2e-4273-a377-6dffbe585f5d"
          width="100%" height="160" frameBorder="0"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Lay Right Here">
        </iframe>
      </div>
      <div className="mp-foot">
        drag the title bar · click × to hide · ⌘M to toggle
      </div>
    </div>
  );
}

/* ─── Footer ─── */
function Foot() {
  return (
    <footer className="foot">
      <div className="foot-why">
        Built for the <b>PostHog Technical Ex-Founder application</b>, in one day.
        Source on GitHub. Instrumented with PostHog. Of course it is.
      </div>
      <div className="foot-replay">
        <span className="rec-dot"></span>
        Every session on this page is recorded, including yours. Wave at the camera.
      </div>
      <div className="foot-links">
        <a href="Batsirai-Chada-Resume.pdf" target="_blank">resume.pdf</a>
        <a href="https://github.com/Batsirai" target="_blank">github · @batsirai</a>
        <a href="https://www.linkedin.com/in/batsirai-chada/" target="_blank">linkedin · batsirai-chada</a>
        <a href="https://x.com/batsirai" target="_blank">x · @batsirai</a>
        <a href="https://alreadylovedkids.com" target="_blank">alreadylovedkids.com</a>
        <a href="https://batsirai.com" target="_blank">batsirai.com / newsletter</a>
        <a href="mailto:batsirai@gmail.com">batsirai@gmail.com</a>
      </div>
      <div className="foot-credit">
        batsirai.os v0.3 · last shipped {new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })} · posthog ❤︎
      </div>
    </footer>
  );
}

/* batsirai.os — main app */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "posthog",
  "density": "comfy",
  "showDesktop": true,
  "showGrain": false,
  "showWallpaper": true,
  "showMiniPlayer": true,
  "monoEverywhere": false
}/*EDITMODE-END*/;

const PALETTES = {
  posthog: {
    label: "PostHog",
    bg: "#E1D7C2", panel: "#FBF8F1", panel2: "#F4EFE2",
    ink: "#141414", ink2: "#2A2723", muted: "#7C7361",
    rule: "#141414", ruleSoft: "#C9C1AB",
    brick: "#B8442D", mustard: "#D69F2E", forest: "#3B6B47", plum: "#6B3A5C", signal: "#E85A1E",
    radius: "0px", radiusSm: "0px",
    border: "1.5px solid #141414",
    borderSoft: "1px solid #C9C1AB",
    shadowHard: "8px 8px 0 #141414",
    shadowSoft: "4px 4px 0 #141414",
    shadowCard: "4px 4px 0 #141414",
    shadowCardHover: "5px 5px 0 #141414",
    shadowButton: "1.5px 1.5px 0 #141414",
    sans: "'IBM Plex Sans', 'Inter', system-ui, sans-serif",
    mono: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace",
  },
  apple: {
    label: "Apple",
    bg: "#F5F5F7", panel: "#FFFFFF", panel2: "#FAFAFC",
    ink: "#1D1D1F", ink2: "#3A3A3C", muted: "#86868B",
    rule: "rgba(0,0,0,0.08)", ruleSoft: "rgba(0,0,0,0.06)",
    brick: "#FF453A", mustard: "#FF9F0A", forest: "#30D158", plum: "#BF5AF2", signal: "#0A84FF",
    radius: "14px", radiusSm: "8px",
    border: "0.5px solid rgba(0,0,0,0.10)",
    borderSoft: "0.5px solid rgba(0,0,0,0.06)",
    shadowHard: "0 12px 40px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)",
    shadowSoft: "0 4px 16px rgba(0,0,0,0.06)",
    shadowCard: "0 2px 8px rgba(0,0,0,0.04)",
    shadowCardHover: "0 6px 20px rgba(0,0,0,0.08)",
    shadowButton: "0 1px 2px rgba(0,0,0,0.06)",
    sans: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif",
    mono: "'SF Mono', 'JetBrains Mono', ui-monospace, monospace",
  },
  terminal: {
    label: "Terminal",
    bg: "#0E0E0C", panel: "#161410", panel2: "#1F1C16",
    ink: "#E8E2D0", ink2: "#C9C1AB", muted: "#8C8470",
    rule: "#E8E2D0", ruleSoft: "#3A352B",
    brick: "#39FF88", mustard: "#F5DC5E", forest: "#74F0A1", plum: "#FF8C5A", signal: "#FF5C39",
    radius: "0px", radiusSm: "0px",
    border: "1.5px solid #E8E2D0",
    borderSoft: "1px solid #3A352B",
    shadowHard: "4px 4px 0 #39FF88",
    shadowSoft: "2px 2px 0 #39FF88",
    shadowCard: "2px 2px 0 #39FF88",
    shadowCardHover: "3px 3px 0 #39FF88",
    shadowButton: "1px 1px 0 #39FF88",
    sans: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace",
    mono: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace",
  },
};

function App() {
  const compactChrome = useMediaQuery('(max-width: 640px)');
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [now, setNow] = React.useState(formatNow());
  const [tab, setTab] = React.useState('readme');
  const [tagFilter, setTagFilter] = React.useState('ALL');
  const [terminalId, setTerminalId] = React.useState(null);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [paletteReason, setPaletteReason] = React.useState(null);
  const [cmdkDiscovered, markCmdkDiscovered] = useCmdkDiscovered();
  const [cmdkNudge, noteCmdkTabVisit] = useCmdkNudge(cmdkDiscovered);
  const [quitting, setQuitting] = React.useState(false);
  const [shutdown, setShutdown] = React.useState(false);
  const winRef = React.useRef(null);
  const tlApi = React.useRef(null);

  function formatNow() {
    const d = new Date();
    return d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  }
  React.useEffect(() => {
    const id = setInterval(() => setNow(formatNow()), 30000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    capturePhOnce('console_delight_shown');
    // eslint-disable-next-line no-console
    console.log(
      '%cbatsirai.os%c Hey PostHog — I built this for you.\nExplore the tabs, ventures, and ⌘K extras.\nIf it lands, book a chat: %s',
      'font-weight:700;font-size:13px;color:#B8442D',
      'font-size:12px;color:#7C7361',
      BOOK_CHAT_URL,
    );
  }, []);

  // palette → css vars
  React.useEffect(() => {
    const p = PALETTES[t.palette] || PALETTES.posthog;
    const r = document.documentElement.style;
    // colors
    r.setProperty('--bg', p.bg);
    r.setProperty('--panel', p.panel);
    r.setProperty('--panel-2', p.panel2);
    r.setProperty('--ink', p.ink);
    r.setProperty('--ink-2', p.ink2);
    r.setProperty('--muted', p.muted);
    r.setProperty('--rule', p.rule);
    r.setProperty('--rule-soft', p.ruleSoft);
    r.setProperty('--brick', p.brick);
    r.setProperty('--mustard', p.mustard);
    r.setProperty('--forest', p.forest);
    r.setProperty('--plum', p.plum);
    r.setProperty('--signal', p.signal);
    // shape
    r.setProperty('--radius', p.radius);
    r.setProperty('--radius-sm', p.radiusSm);
    r.setProperty('--border', p.border);
    r.setProperty('--border-soft', p.borderSoft);
    r.setProperty('--shadow-hard', p.shadowHard);
    r.setProperty('--shadow-soft', p.shadowSoft);
    r.setProperty('--shadow-card', p.shadowCard);
    r.setProperty('--shadow-card-hover', p.shadowCardHover);
    r.setProperty('--shadow-button', p.shadowButton);
    // fonts
    r.setProperty('--sans', t.monoEverywhere ? p.mono : p.sans);
    r.setProperty('--mono', p.mono);
    // theme attribute on body for any conditional CSS
    document.body.dataset.theme = t.palette;
  }, [t.palette, t.monoEverywhere]);

  React.useEffect(() => {
    if (paletteOpen) {
      document.body.dataset.cmdkOpen = '1';
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        delete document.body.dataset.cmdkOpen;
        document.body.style.overflow = prev;
      };
    }
    delete document.body.dataset.cmdkOpen;
  }, [paletteOpen]);

  const openPalette = React.useCallback((source = 'shortcut') => {
    markCmdkDiscovered();
    setPaletteReason(source === 'exit' || source === 'exit_intent' ? 'exit' : null);
    setPaletteOpen(true);
    capturePh('command_palette_opened', { source });
  }, [markCmdkDiscovered]);

  const closePalette = React.useCallback(() => {
    setPaletteOpen(false);
    setPaletteReason(null);
  }, []);

  // keyboard
  React.useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette('shortcut'); }
      if (meta && e.key.toLowerCase() === 'q') { e.preventDefault(); openPalette('exit'); }
      if (meta && e.key === '0') { e.preventDefault(); resetWindow(); }
      if (meta && e.key === 'o') { e.preventDefault(); window.open('Batsirai-Chada-Resume.pdf', '_blank'); }
      if (meta && e.key === 'm') { e.preventDefault(); setTweak('showMiniPlayer', !t.showMiniPlayer); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [t.showMiniPlayer, openPalette]);

  // exit intent — mouse leaves toward browser chrome / another tab
  React.useEffect(() => {
    if (paletteOpen) return;
    const onMouseOut = (e) => {
      if (e.clientY > 12) return;
      if (e.relatedTarget || e.toElement) return;
      try {
        if (sessionStorage.getItem(CMDK_EXIT_INTENT_KEY) === '1') return;
        sessionStorage.setItem(CMDK_EXIT_INTENT_KEY, '1');
      } catch {}
      openPalette('exit_intent');
    };
    document.documentElement.addEventListener('mouseout', onMouseOut);
    return () => document.documentElement.removeEventListener('mouseout', onMouseOut);
  }, [paletteOpen, openPalette]);

  function resetWindow() {
    document.querySelector('.window-wrap')?.style.setProperty('transform', 'translate(0,0)');
  }
  function snapshot() {
    setTerminalId('snapshot_unsupported_demo');
    setTimeout(() => window.print(), 200);
  }
  React.useEffect(() => { noteCmdkTabVisit(tab); }, [tab, noteCmdkTabVisit]);

  const goTab = React.useCallback((id) => {
    setTab(id);
  }, []);

  function shutdownApp() {
    setQuitting(true);
    setTimeout(() => setShutdown(true), 520);
    setTimeout(() => { setShutdown(false); setQuitting(false); }, 2800);
  }

  const ctx = {
    palette: t.palette, setPalette: (v) => setTweak('palette', v),
    monoEverywhere: t.monoEverywhere, setMono: (v) => setTweak('monoEverywhere', v),
    showDesktop: t.showDesktop, setShowDesktop: (v) => setTweak('showDesktop', v),
    showGrain: t.showGrain, setShowGrain: (v) => setTweak('showGrain', v),
    showWallpaper: t.showWallpaper, setShowWallpaper: (v) => setTweak('showWallpaper', v),
    showMiniPlayer: t.showMiniPlayer, setShowMiniPlayer: (v) => setTweak('showMiniPlayer', v),
    tab, setTab: goTab,
    tagFilter, setTagFilter: (v) => { goTab('timeline'); setTagFilter(v); },
    jumpTo: (sectId) => {
      const map = { 's-kpis':'readme', 's-timeline':'timeline', 's-exp':'exp', 's-values':'values', 's-commits':'building', 's-gallery':'gallery', 's-music':'music', 's-live':'live' };
      goTab(map[sectId] || 'readme');
    },
    runScript: (id) => setTerminalId(id),
    openPalette,
    paletteOpen,
    cmdkDiscovered,
    cmdkNudge,
    resetWindow, snapshot, shutdownApp,
    _registerTL: (api) => { tlApi.current = api; },
    tlExpandAll: (v) => tlApi.current?.expandAll(v),
    jumpToMilestone: (idx, flash) => tlApi.current?.jumpToMilestone(idx, flash),
  };

  const commands = [
    { label: 'Open resume.pdf', cat: 'file', run: () => window.open('Batsirai-Chada-Resume.pdf', '_blank') },
    { label: 'Print dashboard',  cat: 'file', run: () => window.print() },
    { label: 'Quit application', cat: 'file', run: () => shutdownApp() },
    { label: 'Run · why_hire.sh',           cat: 'run', run: () => setTerminalId('why_hire') },
    { label: 'Run · apply_to_posthog.sh',   cat: 'run', run: () => setTerminalId('apply') },
    { label: 'Run · benchmark_vs_role.sh',  cat: 'run', run: () => setTerminalId('benchmark') },
    { label: 'Run · check_availability.sh', cat: 'run', run: () => setTerminalId('availability') },
    { label: 'Run · ping_batsirai.sh',      cat: 'run', run: () => setTerminalId('ping') },
    { label: 'Tab · Bio',         cat: 'go', run: () => goTab('readme') },
    { label: 'Tab · Timeline',    cat: 'go', run: () => goTab('timeline') },
    { label: 'Tab · Experiments', cat: 'go', run: () => goTab('exp') },
    { label: 'Tab · Values',      cat: 'go', run: () => goTab('values') },
    { label: 'Tab · Building',    cat: 'go', run: () => goTab('building') },
    { label: 'Tab · Gallery',     cat: 'go', run: () => goTab('gallery') },
    { label: 'Tab · Music',       cat: 'go', run: () => goTab('music') },
    { label: 'Tab · Live',        cat: 'go', run: () => goTab('live') },
    { label: 'Theme · PostHog',  cat: 'view', run: () => setTweak('palette','posthog') },
    { label: 'Theme · Apple',    cat: 'view', run: () => setTweak('palette','apple') },
    { label: 'Theme · Terminal', cat: 'view', run: () => setTweak('palette','terminal') },
    { label: 'Toggle desktop icons', cat: 'view', run: () => setTweak('showDesktop', !t.showDesktop) },
    { label: 'Toggle wallpaper',     cat: 'view', run: () => setTweak('showWallpaper', !t.showWallpaper) },
    { label: 'Filter · built milestones', cat: 'career', run: () => { goTab('timeline'); setTagFilter('BUILT'); } },
    { label: 'Filter · founded milestones', cat: 'career', run: () => { goTab('timeline'); setTagFilter('FOUNDED'); } },
    { label: 'Filter · exited milestones', cat: 'career', run: () => { goTab('timeline'); setTagFilter('EXITED'); } },
    { label: 'Help · about batsirai.os', cat: 'help', run: () => setTerminalId('about') },
    { label: 'Help · keyboard shortcuts', cat: 'help', run: () => setTerminalId('keys') },
  ];

  const leftIcons = [
    { icon: "bio", label: "bio", sub: "start here", tab: 'readme',
      onClick: () => goTab('readme') },
    { icon: "timeline", label: "timeline", sub: "15 yrs", acc: "acc-mustard", tab: 'timeline',
      onClick: () => goTab('timeline') },
    { icon: "experiments", label: "experiments", sub: "7 logged", acc: "acc-brick", tab: 'exp',
      onClick: () => goTab('exp') },
    { icon: "values", label: "values", sub: "in practice", acc: "acc-plum", tab: 'values',
      onClick: () => goTab('values') },
    { icon: "building", label: "building", sub: "live commits", acc: "acc-ink", tab: 'building',
      onClick: () => goTab('building') },
    { icon: "gallery", label: "gallery", sub: "ui & culture", acc: "acc-plum", tab: 'gallery',
      onClick: () => goTab('gallery') },
    { icon: "music", label: "music", sub: "preview listen", tab: 'music',
      onClick: () => goTab('music') },
    { icon: "live", label: "live loop", sub: "this page", acc: "acc-forest", badge: "LIVE", tab: 'live',
      onClick: () => goTab('live') },
  ];
  const rightIcons = [
    { icon: "resume", label: "resume", sub: ".pdf", acc: "acc-brick", href: "Batsirai-Chada-Resume.pdf" },
    { icon: "email", label: "email", sub: "say hi", acc: "acc-plum", href: "mailto:batsirai@gmail.com" },
    { icon: "linkedin", label: "linkedin", sub: "batsirai-chada", href: "https://linkedin.com" },
    { icon: "github", label: "github", sub: "@batsirai", acc: "acc-ink", href: "https://github.com" },
    { icon: "command", label: "command", sub: "palette", acc: "acc-mustard",
      badge: cmdkDiscovered ? null : (cmdkNudge ? "→" : "TRY"),
      onClick: () => openPalette('desktop') },
  ];

  return (
    <AppCtx.Provider value={ctx}>
      <MenuBar now={now} />
      {t.showGrain && <div className="grain"></div>}
      <div className={`desktop ${t.showWallpaper ? 'has-wp' : ''}`}>
        {t.showWallpaper && <div className="wallpaper"></div>}
        {t.showDesktop && <DesktopIcons side="left" items={leftIcons} activeTab={tab} />}
        {t.showDesktop && <DesktopIcons side="right" items={rightIcons} activeTab={tab} />}

        {/* original abstract corner illustration — user can drop their own */}
        <div className="corner-art">
          <image-slot
            id="corner-illustration"
            shape="rect"
            src="/posthog/corner.webp"
            placeholder="drop a corner illustration"
            style={{ width: 380, height: 380, display: 'block' }}>
          </image-slot>
        </div>

        <DraggableWindow
          title={compactChrome ? 'batsirai.os' : 'career.dashboard — batsirai.chada'}
          meta={compactChrome ? null : (
            <>
              <span className="titlebar-refresh">auto-refresh: on</span>
              <CmdkTrigger compact nudge={cmdkNudge && !cmdkDiscovered} />
            </>
          )}>
          <div className="window-body">
            <ProfileSidebar />
            <TabbedMain />
          </div>
          <Foot />
        </DraggableWindow>
      </div>

      {terminalId && (
        <Terminal scriptId={terminalId}
          onClose={() => setTerminalId(null)}
          onRun={(id) => setTerminalId(id)} />
      )}
      {paletteOpen && (
        <CommandPalette commands={commands} reason={paletteReason} onClose={closePalette} />
      )}
      {t.showMiniPlayer && <MiniPlayer onClose={() => setTweak('showMiniPlayer', false)} />}
      {quitting && (
        <style>{`.window-wrap { transform: scale(0.02) translateY(20vh) !important; opacity: 0; transition: transform 0.5s ease-in, opacity 0.5s ease-in; }`}</style>
      )}
      {shutdown && (
        <div className="shutdown">
          <div>
            <div className="msg">batsirai.os is shutting down…</div>
            <small>(it isn't — refresh to come back)</small>
          </div>
        </div>
      )}
      <MobileBookBar />
      <MobileCmdkFab />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Palette">
          <TweakSelect
            label="Theme"
            value={t.palette}
            onChange={v => setTweak('palette', v)}
            options={[
              { value: 'posthog',  label: 'PostHog (default)' },
              { value: 'apple',    label: 'Apple' },
              { value: 'terminal', label: 'Terminal' },
            ]} />
        </TweakSection>
        <TweakSection label="Chrome">
          <TweakToggle label="Wallpaper"        value={t.showWallpaper}  onChange={v => setTweak('showWallpaper', v)} />
          <TweakToggle label="Desktop icons"    value={t.showDesktop}    onChange={v => setTweak('showDesktop', v)} />
          <TweakToggle label="Mini music player" value={t.showMiniPlayer} onChange={v => setTweak('showMiniPlayer', v)} />
          <TweakToggle label="Paper grain"      value={t.showGrain}      onChange={v => setTweak('showGrain', v)} />
          <TweakToggle label="Mono everywhere"  value={t.monoEverywhere} onChange={v => setTweak('monoEverywhere', v)} />
        </TweakSection>
      </TweaksPanel>
    </AppCtx.Provider>
  );
}

export default App;
