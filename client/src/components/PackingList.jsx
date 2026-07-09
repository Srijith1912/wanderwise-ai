import { useEffect, useMemo, useState } from 'react';

function ChecklistRow({ text, isChecked, onToggle, onRemove }) {
  return (
    <li className="flex items-center gap-2.5 group">
      <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
          className="w-4 h-4 accent-forest-600 shrink-0"
        />
        <span className={`text-sm transition ${isChecked ? 'text-ink-400 line-through' : 'text-ink-700 group-hover:text-ink-900'}`}>
          {text}
        </span>
      </label>
      <button
        onClick={onRemove}
        title="Remove item"
        className="text-ink-300 hover:text-coral-600 transition opacity-0 group-hover:opacity-100 shrink-0"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>
    </li>
  );
}

// Renders the AI-generated packing list as an editable checklist. Checked state,
// the user's own items, and any items they've removed all persist per-trip in
// localStorage. Removing an AI item hides it locally (the saved trip is untouched).
export default function PackingList({ packingList, storageKey }) {
  const checkedKey = `wanderwise:packing:${storageKey}`;
  const customKey = `wanderwise:packing-custom:${storageKey}`;
  const removedKey = `wanderwise:packing-removed:${storageKey}`;

  const loadSet = (k) => {
    try { return new Set(JSON.parse(localStorage.getItem(k) || '[]')); } catch { return new Set(); }
  };

  const [checked, setChecked] = useState(() => loadSet(checkedKey));
  const [removed, setRemoved] = useState(() => loadSet(removedKey));
  const [customItems, setCustomItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(customKey) || '[]'); } catch { return []; }
  });
  const [newItem, setNewItem] = useState('');

  useEffect(() => { localStorage.setItem(checkedKey, JSON.stringify([...checked])); }, [checked, checkedKey]);
  useEffect(() => { localStorage.setItem(removedKey, JSON.stringify([...removed])); }, [removed, removedKey]);
  useEffect(() => { localStorage.setItem(customKey, JSON.stringify(customItems)); }, [customItems, customKey]);

  // Each category keeps original item indices (for stable ids) but hides removed ones.
  const categories = useMemo(() => {
    return (packingList || [])
      .filter((c) => c && Array.isArray(c.items) && c.items.length)
      .map((cat) => ({
        category: cat.category,
        items: cat.items
          .map((item, i) => ({ item, id: `${storageKey}::${cat.category}::${item}::${i}` }))
          .filter((x) => !removed.has(x.id)),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [packingList, removed, storageKey]);

  const allIds = useMemo(() => {
    const ids = [];
    categories.forEach((cat) => cat.items.forEach((x) => ids.push(x.id)));
    customItems.forEach((ci) => ids.push(`${storageKey}::custom::${ci.id}`));
    return ids;
  }, [categories, customItems, storageKey]);

  if (categories.length === 0 && customItems.length === 0 && !packingList) return null;

  const total = allIds.length;
  const doneCount = allIds.filter((id) => checked.has(id)).length;
  const progress = total ? Math.round((doneCount / total) * 100) : 0;

  const toggle = (id) => setChecked((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const removeAiItem = (id) => {
    setRemoved((prev) => new Set(prev).add(id));
    setChecked((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const addItem = () => {
    const text = newItem.trim();
    if (!text) return;
    setCustomItems((prev) => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text }]);
    setNewItem('');
  };

  const removeCustom = (id) => {
    setCustomItems((prev) => prev.filter((ci) => ci.id !== id));
    setChecked((prev) => { const n = new Set(prev); n.delete(`${storageKey}::custom::${id}`); return n; });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-lg font-bold text-ink-900">🎒 Packing list</h2>
        <span className="text-xs text-ink-500">{doneCount}/{total} packed</span>
      </div>
      <p className="text-xs text-ink-500 mb-4">
        These are AI suggestions to get you started — check them off, remove what you don't need, and add your own below.
      </p>

      <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden mb-5">
        <div className="h-full bg-forest-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        {categories.map((cat) => (
          <div key={cat.category}>
            <p className="text-xs uppercase tracking-wider text-ink-400 font-semibold mb-2">{cat.category}</p>
            <ul className="space-y-1.5">
              {cat.items.map((x) => (
                <ChecklistRow
                  key={x.id}
                  text={x.item}
                  isChecked={checked.has(x.id)}
                  onToggle={() => toggle(x.id)}
                  onRemove={() => removeAiItem(x.id)}
                />
              ))}
            </ul>
          </div>
        ))}

        {/* Your own items */}
        <div className="sm:col-span-2">
          <p className="text-xs uppercase tracking-wider text-terracotta-500 font-semibold mb-2">Your items</p>
          <ul className="space-y-1.5 mb-3">
            {customItems.length === 0 && (
              <li className="text-sm text-ink-400">Nothing added yet — throw in chargers, meds, that one lucky hat…</li>
            )}
            {customItems.map((ci) => {
              const id = `${storageKey}::custom::${ci.id}`;
              return (
                <ChecklistRow
                  key={ci.id}
                  text={ci.text}
                  isChecked={checked.has(id)}
                  onToggle={() => toggle(id)}
                  onRemove={() => removeCustom(ci.id)}
                />
              );
            })}
          </ul>
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
              placeholder="Add an item…"
              maxLength={80}
              className="flex-1 border border-cream-300 rounded-lg px-3 py-1.5 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
            <button
              onClick={addItem}
              disabled={!newItem.trim()}
              className="btn-secondary text-sm px-4 py-1.5 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
