"use client";

import { useState } from "react";
import {
  createNoteAction,
  deleteNoteAction,
  updateNoteAction,
} from "@/app/account/dashboard-actions";
import type { NoteRow } from "@/lib/account-data";

const inputClass =
  "w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-700";

export function NotesManager({ notes }: { notes: NoteRow[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </p>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-slate-800"
          >
            + New note
          </button>
        )}
      </div>

      {adding && (
        <form
          action={createNoteAction}
          onSubmit={() => setAdding(false)}
          className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
        >
          <input
            name="title"
            placeholder="Title (optional)"
            maxLength={120}
            className={inputClass}
          />
          <textarea
            name="body"
            placeholder="Write a note — addresses to revisit, questions for an agent, anything."
            maxLength={8000}
            className={`mt-3 min-h-24 ${inputClass}`}
          />
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              className="rounded-full bg-cyan-700 px-4 py-2 text-xs font-black text-white transition hover:bg-cyan-800"
            >
              Save note
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 && !adding ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm font-semibold text-slate-500">
          No notes yet. Jot down anything you want to remember.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.map((note) =>
            editingId === note.id ? (
              <li key={note.id}>
                <form
                  action={updateNoteAction}
                  onSubmit={() => setEditingId(null)}
                  className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                >
                  <input type="hidden" name="id" value={note.id} />
                  <input
                    name="title"
                    defaultValue={note.title ?? ""}
                    placeholder="Title (optional)"
                    maxLength={120}
                    className={inputClass}
                  />
                  <textarea
                    name="body"
                    defaultValue={note.body}
                    maxLength={8000}
                    className={`mt-3 min-h-24 ${inputClass}`}
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="submit"
                      className="rounded-full bg-cyan-700 px-4 py-2 text-xs font-black text-white transition hover:bg-cyan-800"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </li>
            ) : (
              <li
                key={note.id}
                className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {note.title ? (
                      <p className="text-sm font-black text-slate-900">
                        {note.title}
                      </p>
                    ) : null}
                    {note.body ? (
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">
                        {note.body}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(note.id)}
                      className="rounded-full px-2 py-1 text-xs font-black text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      Edit
                    </button>
                    <form action={deleteNoteAction}>
                      <input type="hidden" name="id" value={note.id} />
                      <button
                        type="submit"
                        className="rounded-full px-2 py-1 text-xs font-black text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
