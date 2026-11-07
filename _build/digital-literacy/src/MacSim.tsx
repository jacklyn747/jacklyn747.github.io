
/* ─────────────────────────────────────────────────────────────
   MacSim — the Digital Literacy capstone: a live, interactive
   Mac-style desktop, rebuilt clean (no Apple trademarked assets).
   Supports: move/drag windows, focus, double-click to open files
   and apps, drag files to the Trash, minimize to the dock and
   restore, and a Finder-style file browser.
   ───────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useRef, useState } from "react";
import "./mac-sim.css";

type Kind = "finder" | "notes" | "calendar" | "trash" | "txt" | "pdf";
type FileItem = { id: string; name: string; kind: "txt" | "pdf"; x: number; y: number; body?: string };
type Win = { id: string; kind: Kind; fileId?: string; title: string; x: number; y: number; w: number; h: number; z: number; min: boolean };

/* Events the capstone task-rail listens to. Only emitted when a consumer
   passes onEvent; the case-study showpiece passes neither prop, so its
   behavior is unchanged. */
export type SimEvent =
  | { type: "open" | "focus" | "close" | "minimize" | "restore"; kind: Kind; fileId?: string; title?: string }
  | { type: "type" | "enter"; value: string };

const INITIAL_FILES: FileItem[] = [
  { id: "readme", name: "Read Me First.txt", kind: "txt", x: 0, y: 0, body: "welcome" },
  { id: "resume", name: "My Résumé.pdf", kind: "pdf", x: 0, y: 0 },
  { id: "notes", name: "Interview Notes.txt", kind: "txt", x: 0, y: 0, body: "interview" },
];

const clampNum = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ── Icons (generic, original) ── */
function FileGlyph({ kind }: { kind: "txt" | "pdf" }) {
  return (
    <svg className="ico" viewBox="0 0 52 62" fill="none">
      <path d="M6 2h29l11 11v45a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" fill="#fff" stroke="#d3d3d9" strokeWidth="1" />
      <path d="M35 2v11h11" fill="#e9e9ee" stroke="#d3d3d9" strokeWidth="1" />
      {kind === "txt" ? (
        <g stroke="#b7b7c0" strokeWidth="2" strokeLinecap="round">
          <path d="M14 26h24M14 33h24M14 40h24M14 47h15" />
        </g>
      ) : (
        <>
          <rect x="9" y="40" width="34" height="15" rx="2.5" fill="#e0433b" />
          <text x="26" y="51" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="Arial">PDF</text>
        </>
      )}
    </svg>
  );
}
function DockGlyph({ app }: { app: Kind }) {
  if (app === "finder")
    return (
      <svg className="glyph" viewBox="0 0 46 46">
        <rect width="46" height="46" rx="11" fill="url(#fg)" />
        <defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3aa0ff" /><stop offset="1" stopColor="#1d6fe0" /></linearGradient></defs>
        <path d="M23 4v38" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        <path d="M11 5v14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M35 5v14" stroke="#dcebff" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M14 28c4 5 14 5 18 0" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </svg>
    );
  if (app === "notes")
    return (
      <svg className="glyph" viewBox="0 0 46 46">
        <rect width="46" height="46" rx="11" fill="#fff" />
        <rect width="46" height="12" rx="11" fill="#fcd45b" />
        <rect y="7" width="46" height="6" fill="#fcd45b" />
        <g stroke="#e6c24d" strokeWidth="2" strokeLinecap="round"><path d="M11 21h24M11 28h24M11 35h15" /></g>
      </svg>
    );
  if (app === "calendar")
    return (
      <svg className="glyph" viewBox="0 0 46 46">
        <rect width="46" height="46" rx="11" fill="#fff" />
        <rect width="46" height="13" rx="11" fill="#f0463a" />
        <rect y="8" width="46" height="5" fill="#f0463a" />
        <text x="23" y="8.5" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff" fontFamily="Arial">FRI</text>
        <text x="23" y="38" textAnchor="middle" fontSize="22" fontWeight="600" fill="#3a3a3f" fontFamily="Arial">12</text>
      </svg>
    );
  // trash
  return (
    <svg className="glyph" viewBox="0 0 46 46" style={{ padding: 3 }}>
      <path d="M13 15h20l-1.6 24a2 2 0 0 1-2 1.9H16.6a2 2 0 0 1-2-1.9z" fill="none" stroke="#d7d7de" strokeWidth="2" />
      <path d="M10 15h26" stroke="#d7d7de" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 12c0-1.6 1.3-3 3-3h2c1.7 0 3 1.4 3 3" fill="none" stroke="#d7d7de" strokeWidth="2" />
      <path d="M20 21v13M26 21v13" stroke="#d7d7de" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function MacSim({ courseMode = false, onEvent }: { courseMode?: boolean; onEvent?: (e: SimEvent) => void } = {}) {
  const simRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ mode: "win" | "file"; id: string; offX: number; offY: number; moved: boolean } | null>(null);
  // Keep the latest callback without churning memoized deps.
  const evRef = useRef(onEvent);
  useEffect(() => { evRef.current = onEvent; }, [onEvent]);
  const emit = useCallback((e: SimEvent) => evRef.current?.(e), []);
  const winsRef = useRef<Win[]>([]);

  const [files, setFiles] = useState<FileItem[]>(() =>
    INITIAL_FILES.map((f, i) => ({ ...f, x: 999, y: 44 + i * 96 })) // x fixed after mount to right edge
  );
  const [trashed, setTrashed] = useState<FileItem[]>([]);
  const [windows, setWindows] = useState<Win[]>([]);
  const [zTop, setZTop] = useState(30);
  const [dragging, setDragging] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [trashHot, setTrashHot] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [clock, setClock] = useState("");
  const [hint, setHint] = useState(true);

  // place desktop files against the right edge once we know the size
  useEffect(() => {
    const r = simRef.current?.getBoundingClientRect();
    if (r) setFiles((fs) => fs.map((f, i) => ({ ...f, x: r.width - 92, y: 44 + i * 96 })));
  }, []);

  // Mirror windows into a ref so event emission can read current state
  // without emitting from inside a setState updater (avoids double-fire).
  useEffect(() => { winsRef.current = windows; }, [windows]);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    tick();
    const t = setInterval(tick, 15000);
    return () => clearInterval(t);
  }, []);

  const toLocal = (e: PointerEvent | React.PointerEvent) => {
    const r = simRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
  };
  const overTrash = (e: PointerEvent) => {
    const r = trashRef.current?.getBoundingClientRect();
    return !!r && e.clientX >= r.left - 10 && e.clientX <= r.right + 10 && e.clientY >= r.top - 10 && e.clientY <= r.bottom + 10;
  };

  const focus = useCallback((id: string) => {
    const target = winsRef.current.find((w) => w.id === id);
    if (target) emit({ type: target.min ? "restore" : "focus", kind: target.kind, fileId: target.fileId, title: target.title });
    setWindows((ws) => {
      const nz = zTop + 1;
      setZTop(nz);
      return ws.map((w) => (w.id === id ? { ...w, z: nz, min: false } : w));
    });
  }, [zTop, emit]);

  const openWin = useCallback((kind: Kind, opts?: { fileId?: string; title?: string }) => {
    setHint(false);
    const already = winsRef.current.find((w) => (opts?.fileId ? w.fileId === opts.fileId : w.kind === kind && !w.fileId));
    emit({ type: already ? "focus" : "open", kind, fileId: opts?.fileId, title: opts?.title ?? cap(kind) });
    setWindows((ws) => {
      // focus existing app/file window if already open
      const existing = ws.find((w) => (opts?.fileId ? w.fileId === opts.fileId : w.kind === kind && !w.fileId));
      const nz = zTop + 1;
      setZTop(nz);
      if (existing) return ws.map((w) => (w.id === existing.id ? { ...w, z: nz, min: false } : w));
      // Course mode uses smaller, higher windows so content always clears the dock.
      const size: Record<string, { w: number; h: number }> = courseMode ? {
        finder: { w: 340, h: 224 }, notes: { w: 300, h: 206 }, calendar: { w: 300, h: 236 },
        trash: { w: 300, h: 200 }, txt: { w: 300, h: 206 }, pdf: { w: 320, h: 230 },
      } : {
        finder: { w: 520, h: 340 }, notes: { w: 380, h: 300 }, calendar: { w: 360, h: 320 },
        trash: { w: 440, h: 300 }, txt: { w: 420, h: 300 }, pdf: { w: 480, h: 360 },
      };
      const s = size[kind] ?? { w: courseMode ? 300 : 420, h: courseMode ? 206 : 320 };
      const n = ws.length;
      const id = `${kind}-${opts?.fileId ?? ""}-${Date.now()}`;
      const x = courseMode ? 54 + n * 20 : 120 + n * 26;
      const y = courseMode ? 44 + n * 18 : 70 + n * 24;
      return [...ws, { id, kind, fileId: opts?.fileId, title: opts?.title ?? cap(kind), x, y, ...s, z: nz, min: false }];
    });
  }, [zTop, emit, courseMode]);

  const openFile = (f: FileItem) => openWin(f.kind, { fileId: f.id, title: f.name });
  const closeWin = (id: string) => {
    const w = winsRef.current.find((x) => x.id === id);
    if (w) emit({ type: "close", kind: w.kind, fileId: w.fileId, title: w.title });
    setWindows((ws) => ws.filter((x) => x.id !== id));
  };
  const minWin = (id: string) => {
    const w = winsRef.current.find((x) => x.id === id);
    if (w) emit({ type: "minimize", kind: w.kind, fileId: w.fileId, title: w.title });
    setWindows((ws) => ws.map((x) => (x.id === id ? { ...x, min: true } : x)));
  };

  const trashFile = (id: string) => {
    setFiles((fs) => {
      const f = fs.find((x) => x.id === id);
      if (f) setTrashed((t) => (t.some((x) => x.id === id) ? t : [...t, f]));
      return fs.filter((x) => x.id !== id);
    });
    // close any open window for that file
    setWindows((ws) => ws.filter((w) => w.fileId !== id));
  };
  const emptyTrash = () => setTrashed([]);

  const startWinDrag = (e: React.PointerEvent, id: string) => {
    focus(id);
    const w = windows.find((x) => x.id === id);
    if (!w) return;
    const p = toLocal(e);
    dragRef.current = { mode: "win", id, offX: p.x - w.x, offY: p.y - w.y, moved: false };
    setDragId(id);
    setDragging(true);
  };
  const startFileDrag = (e: React.PointerEvent, id: string) => {
    setSel(id);
    const f = files.find((x) => x.id === id);
    if (!f) return;
    const p = toLocal(e);
    dragRef.current = { mode: "file", id, offX: p.x - f.x, offY: p.y - f.y, moved: false };
    setDragId(id);
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      d.moved = true;
      const p = toLocal(e);
      if (d.mode === "win") {
        setWindows((ws) => ws.map((w) => (w.id === d.id ? { ...w, x: clampNum(p.x - d.offX, -w.w + 80, p.w - 40), y: clampNum(p.y - d.offY, 26, p.h - 40) } : w)));
      } else {
        setFiles((fs) => fs.map((f) => (f.id === d.id ? { ...f, x: p.x - d.offX, y: p.y - d.offY } : f)));
        setTrashHot(overTrash(e));
      }
    };
    const up = (e: PointerEvent) => {
      const d = dragRef.current;
      if (d && d.mode === "file" && overTrash(e)) trashFile(d.id);
      dragRef.current = null;
      setDragging(false);
      setDragId(null);
      setTrashHot(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging]);

  const minimized = windows.filter((w) => w.min);

  return (
    <div className="macsim" ref={simRef} onPointerDown={() => setSel(null)}>
      {/* menu bar */}
      <div className="mac-menubar">
        <span className="mark" />
        <span className="app">Finder</span>
        <span className="menus"><span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Window</span><span>Help</span></span>
        <span className="right">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="#fff" strokeWidth="1.2"><path d="M2 8a7 7 0 0 1 14 0" /><path d="M5 9.5a4 4 0 0 1 8 0" /><circle cx="9" cy="10.5" r="0.8" fill="#fff" stroke="none" /></svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="1" y="2.5" width="19" height="7" rx="2" stroke="#fff" strokeWidth="1.1" /><rect x="2.5" y="4" width="13" height="4" rx="1" fill="#fff" /><rect x="21" y="4.5" width="1.6" height="3" rx="0.8" fill="#fff" /></svg>
          <span className="clock" suppressHydrationWarning>{clock}</span>
        </span>
      </div>

      {hint && !courseMode && <div className="mac-hint">This one works. Open a file, drag it to the Trash, move a window.</div>}

      {/* desktop files */}
      {files.map((f) => (
        <div
          key={f.id}
          className={`mac-file${sel === f.id ? " sel" : ""}${dragId === f.id ? " dragging" : ""}`}
          style={{ left: f.x, top: f.y }}
          onPointerDown={(e) => { e.stopPropagation(); startFileDrag(e, f.id); }}
          onDoubleClick={() => openFile(f)}
        >
          <FileGlyph kind={f.kind} />
          <span className="nm">{f.name}</span>
        </div>
      ))}

      {/* windows */}
      {windows.filter((w) => !w.min).map((w) => (
        <div key={w.id} className="mac-window" style={{ left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }} onPointerDown={() => focus(w.id)}>
          <div className="mac-titlebar" onPointerDown={(e) => startWinDrag(e, w.id)}>
            <span className="mac-lights">
              <span className="light red" onPointerDown={(e) => e.stopPropagation()} onClick={() => closeWin(w.id)}><svg viewBox="0 0 8 8"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5" /></svg></span>
              <span className="light yellow" onPointerDown={(e) => e.stopPropagation()} onClick={() => minWin(w.id)}><svg viewBox="0 0 8 8"><path d="M1.3 4h5.4" /></svg></span>
              <span className="light green" onPointerDown={(e) => e.stopPropagation()}><svg viewBox="0 0 8 8"><path d="M2 2h4v4" /></svg></span>
            </span>
            <span className="mac-title">{w.title}</span>
          </div>
          <div className="mac-winbody">
            <WindowContent win={w} files={files} trashed={trashed} openFile={openFile} emptyTrash={emptyTrash} courseMode={courseMode} emit={emit} />
          </div>
        </div>
      ))}

      {/* dock */}
      <div className={`mac-dock${trashHot ? " trash-hot" : ""}`}>
        <span className="dock-item" onPointerDown={(e) => e.stopPropagation()} onClick={() => openWin("finder")}><DockGlyph app="finder" />{windows.some((w) => w.kind === "finder") && <span className="run" />}</span>
        <span className="dock-item" onPointerDown={(e) => e.stopPropagation()} onClick={() => openWin("notes")}><DockGlyph app="notes" />{windows.some((w) => w.kind === "notes") && <span className="run" />}</span>
        <span className="dock-item" onPointerDown={(e) => e.stopPropagation()} onClick={() => openWin("calendar")}><DockGlyph app="calendar" />{windows.some((w) => w.kind === "calendar") && <span className="run" />}</span>
        {minimized.length > 0 && <span className="dock-sep" />}
        {minimized.map((w) => (
          <span key={w.id} className="dock-item" title={w.title} onPointerDown={(e) => e.stopPropagation()} onClick={() => focus(w.id)}>
            {w.fileId ? <FileGlyph kind={w.kind === "pdf" ? "pdf" : "txt"} /> : <DockGlyph app={w.kind} />}
          </span>
        ))}
        <span className="dock-sep" />
        <span className="dock-item trash" ref={trashRef} onPointerDown={(e) => e.stopPropagation()} onClick={() => openWin("trash", { title: "Trash" })}><DockGlyph app="trash" /></span>
      </div>
    </div>
  );
}

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function WindowContent({ win, files, trashed, openFile, emptyTrash, courseMode, emit }: { win: Win; files: FileItem[]; trashed: FileItem[]; openFile: (f: FileItem) => void; emptyTrash: () => void; courseMode?: boolean; emit?: (e: SimEvent) => void }) {
  if (win.kind === "finder")
    return (
      <div className="finder">
        <div className="side">
          <div className="grp">Favorites</div>
          <div className="row"><span className="d" />Recents</div>
          <div className="row"><span className="d" />Documents</div>
          <div className="row on"><span className="d" />Desktop</div>
          <div className="row"><span className="d" />Downloads</div>
        </div>
        <div className="list">
          {files.map((f) => (
            <div key={f.id} className="item" onDoubleClick={() => openFile(f)}>
              <FileGlyph kind={f.kind} />
              <span className="nm">{f.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  if (win.kind === "trash")
    return (
      <div className="trashw">
        <div className="bar"><span>{trashed.length ? `${trashed.length} item${trashed.length > 1 ? "s" : ""}` : "Trash is empty"}</span>{trashed.length > 0 && <span className="empty-btn" onClick={emptyTrash}>Empty</span>}</div>
        {trashed.length ? (
          <div className="list">
            {trashed.map((f) => (<div key={f.id} className="item"><FileGlyph kind={f.kind} /><span className="nm">{f.name}</span></div>))}
          </div>
        ) : <div className="none">Drag a file from the desktop onto the Trash to delete it.</div>}
      </div>
    );
  if (win.kind === "calendar") {
    const dows = ["S", "M", "T", "W", "T", "F", "S"];
    const cells = Array.from({ length: 35 }, (_, i) => i - 3); // offset so 1 lands mid-week
    return (
      <div className="cal">
        <div className="mo">This Month</div>
        <div className="grid">
          {dows.map((d, i) => <div key={i} className="dow">{d}</div>)}
          {cells.map((n, i) => (<div key={i} className={`day${n < 1 || n > 30 ? " dim" : ""}${n === 12 ? " today" : ""}`}>{((n - 1 + 30) % 30) + 1}</div>))}
        </div>
      </div>
    );
  }
  // txt / pdf (from a file), or notes app
  const file = win.fileId ? files.find((f) => f.id === win.fileId) : undefined;
  if (win.kind === "pdf")
    return (
      <div className="pdf">
        <div className="page">
          <h2>Jackie Miller</h2>
          <div className="role">Instructional Designer</div>
          <div className="ln" /><div className="ln" /><div className="ln s" />
          <div style={{ height: 18 }} /><div className="ln" /><div className="ln" /><div className="ln" /><div className="ln s" />
          <div style={{ height: 18 }} /><div className="ln" /><div className="ln s" />
        </div>
      </div>
    );
  if (win.kind === "notes")
    return (
      <div className="doc">
        <h3>Notes</h3>
        {courseMode ? (
          <>
            <p className="muted">Type your first name below, then press Enter.</p>
            <input
              className="notes-input"
              autoFocus
              placeholder="Type here…"
              aria-label="Type your first name, then press Enter"
              onChange={(e) => emit?.({ type: "type", value: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); emit?.({ type: "enter", value: (e.target as HTMLInputElement).value }); } }}
            />
          </>
        ) : (
          <p className="muted">A blank note. On a real laptop this is where you&apos;d jot something down: a phone number, a to-do, a draft of an email.</p>
        )}
      </div>
    );
  // txt file
  const body = file?.body === "interview"
    ? (<><h3>Interview Notes</h3><p>Arrive 10 minutes early. Bring two copies of the résumé.</p><p className="muted">Practice the laptop steps first: open a file, type your name, close the window.</p></>)
    : (<><h3>Read Me First</h3><p>This is a real, working desktop. Go ahead and try it.</p><p className="muted">Double-click a file to open it. Drag a file onto the Trash. Move a window by its title bar. Click the yellow dot to minimize.</p></>);
  return <div className="doc">{body}</div>;
}
