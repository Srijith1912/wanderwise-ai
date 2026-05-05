import { useEffect, useRef, useState } from "react";
import { autocompleteDestinations } from "../utils/geocode";

// Destination input with Mapbox-powered autocomplete dropdown. Drop-in for any text input
// where the user is naming a place. Calls onChange with the selected/typed string.
export default function DestinationInput({
  value,
  onChange,
  placeholder,
  className = "input-field",
  inputClassName,
  id,
  iconLeft,
  ariaLabel = "Destination",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapperRef = useRef(null);
  const lastFetchedFor = useRef("");
  // Track whether the most recent input came from the user typing vs. a programmatic value change.
  // We only fetch suggestions on user-typed input — keeps the dropdown from popping up after a select.
  const userTypedRef = useRef(false);

  // Debounced fetch
  useEffect(() => {
    if (!userTypedRef.current) return;
    const q = (value || "").trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    if (q === lastFetchedFor.current) return;
    const t = setTimeout(async () => {
      const results = await autocompleteDestinations(q);
      lastFetchedFor.current = q;
      setSuggestions(results);
      setHighlight(-1);
      if (results.length > 0) setOpen(true);
    }, 220);
    return () => clearTimeout(t);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleSelect = (s) => {
    userTypedRef.current = false;
    onChange(s.name);
    setOpen(false);
    setSuggestions([]);
  };

  const handleKey = (e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {iconLeft ? (
        <div className="flex items-center gap-3">
          {iconLeft}
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => {
              userTypedRef.current = true;
              onChange(e.target.value);
            }}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            aria-label={ariaLabel}
            autoComplete="off"
            className={inputClassName || className}
          />
        </div>
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            userTypedRef.current = true;
            onChange(e.target.value);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          aria-label={ariaLabel}
          autoComplete="off"
          className={inputClassName || className}
        />
      )}

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-cream-300 rounded-xl shadow-card max-h-64 overflow-y-auto scrollbar-thin"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id || s.name}
              role="option"
              aria-selected={i === highlight}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(s);
              }}
              onMouseEnter={() => setHighlight(i)}
              className={`px-3 py-2 text-sm cursor-pointer transition ${
                i === highlight ? "bg-forest-50 text-forest-800" : "text-ink-800 hover:bg-cream-100"
              }`}
            >
              <div className="font-medium">{s.shortName}</div>
              <div className="text-xs text-ink-500 truncate">{s.name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
