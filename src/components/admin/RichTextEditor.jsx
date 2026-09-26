import { useRef, useEffect } from "react";

const BUTTONS = [
  { cmd: "bold", label: "B", style: { fontWeight: 700 } },
  { cmd: "italic", label: "I", style: { fontStyle: "italic" } },
  { cmd: "underline", label: "U", style: { textDecoration: "underline" } },
  { cmd: "insertUnorderedList", label: "• Lista" },
  { cmd: "insertOrderedList", label: "1. Lista" },
];

export default function RichTextEditor({ value, onChange, placeholder }) {
  const ref = useRef(null);

  // Solo sincroniza el HTML cuando cambia desde afuera (ej. al abrir "Editar"),
  // para no pelear con el cursor mientras el usuario escribe.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd) => {
    ref.current?.focus();
    document.execCommand(cmd, false, null);
    onChange(ref.current?.innerHTML || "");
  };

  return (
    <div className="rte">
      <div className="rte__toolbar">
        {BUTTONS.map((b) => (
          <button
            key={b.cmd}
            type="button"
            className="rte__btn"
            style={b.style}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(b.cmd)}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="rte__content"
        contentEditable
        data-placeholder={placeholder}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
}
