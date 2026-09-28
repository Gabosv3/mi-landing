import { useEffect, useRef, useState } from "react";

export default function FilterSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className={`fselect${open ? " fselect--open" : ""}`} ref={ref}>
      <button
        type="button"
        className="fselect__trigger"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{value}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="fselect__chevron">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      {open && (
        <ul className="fselect__menu">
          {options.map((opt) => (
            <li
              key={opt}
              className={`fselect__option${opt === value ? " fselect__option--active" : ""}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
