"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  /** Form field name. Files arrive in the server action as formData.getAll(name). */
  name: string;
  /** Hard cap on number of photos. Default 12 — covers hero + aerial + 6 features + spares. */
  max?: number;
  /** Help text shown under the picker. */
  helpText?: string;
};

type Entry = {
  /** Stable ID so React can track the row when files shift. */
  id: string;
  file: File;
  previewUrl: string;
};

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 12 * 1024 * 1024;

/**
 * Multi-photo picker with preview thumbnails and per-file remove.
 *
 * Used inside a regular <form action={serverAction}> — the picked files
 * arrive on the server as formData.getAll(name). The actual <input> is
 * kept in the DOM and its `files` FileList is kept in sync with our
 * state via the DataTransfer constructor (supported in all modern
 * browsers).
 *
 * Rejects unsupported types and files over 12 MB at pick time, so users
 * see immediate feedback instead of a confusing server-side error.
 */
export function PhotoUpload({ name, max = 12, helpText }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Mirror state -> <input>.files so the form submission includes them.
  useEffect(() => {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    for (const e of entries) dt.items.add(e.file);
    inputRef.current.files = dt.files;
  }, [entries]);

  // Revoke object URLs on unmount / when entries change.
  useEffect(() => {
    return () => {
      for (const e of entries) URL.revokeObjectURL(e.previewUrl);
    };
    // entries intentionally excluded — we revoke per-entry on remove and
    // wholesale on unmount via the cleanup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (incoming: FileList | File[]) => {
    setError(null);
    const list = Array.from(incoming);
    const next: Entry[] = [...entries];

    for (const file of list) {
      if (next.length >= max) {
        setError(`You can upload up to ${max} photos. Remove some to add more.`);
        break;
      }
      if (!ALLOWED.includes(file.type)) {
        setError(`Unsupported file type: ${file.type || "unknown"}. Use JPEG, PNG, or WebP.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError(`File ${file.name} is over 12 MB.`);
        continue;
      }
      next.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setEntries(next);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    // Reset the input's value so picking the same file twice still
    // triggers onChange.
    e.target.value = "";
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const dead = prev.find((e) => e.id === id);
      if (dead) URL.revokeObjectURL(dead.previewUrl);
      return prev.filter((e) => e.id !== id);
    });
  };

  const moveEntry = (id: string, direction: -1 | 1) => {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx < 0) return prev;
      const target = idx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  const totalSizeMb = useMemo(
    () => (entries.reduce((s, e) => s + e.file.size, 0) / 1024 / 1024).toFixed(1),
    [entries],
  );

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={ALLOWED.join(",")}
        multiple
        className="sr-only"
        onChange={onInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${
          isDragging
            ? "border-cyan-600 bg-cyan-50"
            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
        }`}
      >
        <p className="text-base font-black text-slate-950">
          Drop photos here or click to choose
        </p>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          JPEG · PNG · WebP · up to 12 MB each · max {max} files
        </p>
        {helpText ? (
          <p className="mt-3 max-w-md text-xs text-slate-600">{helpText}</p>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-xs font-bold text-rose-700">{error}</p>
      ) : null}

      {entries.length > 0 ? (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>
              {entries.length} photo{entries.length === 1 ? "" : "s"} · {totalSizeMb} MB total
            </span>
            <span className="text-slate-400">First photo becomes the hero · drag/reorder with arrows</span>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {entries.map((e, i) => (
              <li
                key={e.id}
                className="group relative overflow-hidden rounded-2xl ring-1 ring-slate-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={e.previewUrl}
                  alt={e.file.name}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-2 text-xs font-black uppercase tracking-[0.14em] text-white">
                  <span>{i === 0 ? "Hero" : `#${i + 1}`}</span>
                  <button
                    type="button"
                    onClick={() => removeEntry(e.id)}
                    aria-label={`Remove ${e.file.name}`}
                    className="rounded-full bg-white/20 px-2 py-0.5 hover:bg-rose-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-2">
                  <button
                    type="button"
                    onClick={() => moveEntry(e.id, -1)}
                    disabled={i === 0}
                    aria-label="Move earlier"
                    className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white hover:bg-white/40 disabled:opacity-30"
                  >
                    ←
                  </button>
                  <span className="truncate text-[10px] text-white/80">{e.file.name}</span>
                  <button
                    type="button"
                    onClick={() => moveEntry(e.id, 1)}
                    disabled={i === entries.length - 1}
                    aria-label="Move later"
                    className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white hover:bg-white/40 disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
