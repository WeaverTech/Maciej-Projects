"use client";

import { useCallback, useRef, useState } from "react";

/**
 * QuickQuoteForm — interaktywny moduł "Szybka wycena".
 *
 * Strefa Drag & Drop przyjmuje pliki CAD (.step / .stp / .stl / .iges / .igs),
 * waliduje rozszerzenie i rozmiar, po czym wysyła je razem z danymi
 * kontaktowymi jako multipart/form-data na endpoint /api/quote
 * (do podpięcia: S3 presigned upload / e-mail / CRM).
 */

const ACCEPTED_EXTENSIONS = [".step", ".stp", ".stl", ".iges", ".igs"];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILES = 5;

type SubmitStatus = "idle" | "sending" | "success" | "error";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return `Nieobsługiwany format: ${file.name}. Akceptujemy ${ACCEPTED_EXTENSIONS.join(", ")}.`;
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `Plik ${file.name} przekracza limit ${MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
}

export function QuickQuoteForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    setFileError(null);
    const next: File[] = [];
    for (const file of Array.from(incoming)) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        continue;
      }
      next.push(file);
    }
    setFiles((prev) => {
      const merged = [...prev];
      for (const f of next) {
        // deduplikacja po nazwie i rozmiarze
        if (!merged.some((m) => m.name === f.name && m.size === f.size)) {
          merged.push(f);
        }
      }
      if (merged.length > MAX_FILES) {
        setFileError(`Maksymalnie ${MAX_FILES} plików na zgłoszenie.`);
        return merged.slice(0, MAX_FILES);
      }
      return merged;
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const formData = new FormData(e.currentTarget);
    files.forEach((file) => formData.append("models", file));

    try {
      const res = await fetch("/api/quote", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("success");
      setFiles([]);
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-start justify-center rounded-sm border border-steel bg-anthracite/80 p-8 backdrop-blur-sm">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
          Zgłoszenie wysłane
        </p>
        <h3 className="mt-3 text-2xl font-light text-blueprint">
          Dziękujemy!
        </h3>
        <p className="mt-3 font-mono text-sm leading-relaxed text-steel-light">
          Analizujemy przesłane pliki. Wycenę wraz z rekomendacją technologii
          otrzymasz na podany adres e-mail.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 font-mono text-xs text-steel-light underline underline-offset-4 transition-colors hover:text-accent"
        >
          Wyślij kolejne zapytanie
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-sm border border-steel bg-anthracite/80 p-6 backdrop-blur-sm md:p-8"
    >
      <h3 className="font-mono text-sm uppercase tracking-[0.25em] text-blueprint">
        Szybka wycena
      </h3>

      {/* ===== Strefa Drag & Drop ===== */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Wgraj pliki CAD (.step, .stl)"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed px-6 py-10 text-center transition-colors ${
          isDragOver
            ? "border-accent bg-accent/10"
            : "border-steel hover:border-steel-light"
        }`}
      >
        <svg
          className={`h-8 w-8 transition-colors ${isDragOver ? "text-accent" : "text-steel-light"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path
            d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-3 font-mono text-sm text-blueprint">
          Przeciągnij i upuść pliki modeli
        </p>
        <p className="mt-1 font-mono text-xs text-steel-light">
          {ACCEPTED_EXTENSIONS.join(" · ")} — maks. {MAX_FILE_SIZE_MB} MB /
          plik
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(",")}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {fileError && (
        <p className="mt-2 font-mono text-xs text-accent">{fileError}</p>
      )}

      {/* Lista wgranych plików */}
      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center justify-between rounded-sm bg-graphite px-3 py-2 font-mono text-xs text-steel-light"
            >
              <span className="truncate">
                {file.name}{" "}
                <span className="text-steel">({formatBytes(file.size)})</span>
              </span>
              <button
                type="button"
                aria-label={`Usuń plik ${file.name}`}
                onClick={() => removeFile(i)}
                className="ml-3 shrink-0 text-steel-light transition-colors hover:text-accent"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ===== Dane kontaktowe ===== */}
      <div className="mt-6 grid gap-4">
        <label className="grid gap-1.5">
          <span className="font-mono text-xs uppercase tracking-widest text-steel-light">
            Imię i nazwisko / firma
          </span>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            className="rounded-sm border border-steel bg-graphite px-3 py-2.5 font-mono text-sm text-blueprint outline-none transition-colors placeholder:text-steel focus:border-accent"
            placeholder="Jan Kowalski / Firma Sp. z o.o."
          />
        </label>

        <label className="grid gap-1.5">
          <span className="font-mono text-xs uppercase tracking-widest text-steel-light">
            E-mail
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-sm border border-steel bg-graphite px-3 py-2.5 font-mono text-sm text-blueprint outline-none transition-colors placeholder:text-steel focus:border-accent"
            placeholder="adres@firma.pl"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="font-mono text-xs uppercase tracking-widest text-steel-light">
            Opis projektu (opcjonalnie)
          </span>
          <textarea
            name="message"
            rows={3}
            className="resize-none rounded-sm border border-steel bg-graphite px-3 py-2.5 font-mono text-sm text-blueprint outline-none transition-colors placeholder:text-steel focus:border-accent"
            placeholder="Ilość sztuk, materiał, tolerancje, termin…"
          />
        </label>
      </div>

      {status === "error" && (
        <p className="mt-3 font-mono text-xs text-accent">
          Nie udało się wysłać zgłoszenia. Spróbuj ponownie lub napisz na
          kontakt@2mak.pl.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 w-full rounded-sm bg-accent px-6 py-3 font-mono text-sm font-medium uppercase tracking-widest text-graphite transition-colors hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Wysyłanie…" : "Wyślij do analizy"}
      </button>
    </form>
  );
}
