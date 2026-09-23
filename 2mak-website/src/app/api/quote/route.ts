import { NextResponse } from "next/server";

/**
 * POST /api/quote — odbiór zgłoszenia "Szybka wycena".
 *
 * Szkielet: waliduje multipart/form-data i loguje metadane zgłoszenia.
 * Do podpięcia w produkcji (patrz IMPLEMENTATION_PLAN.md):
 *  - upload plików do S3/R2 (presigned URL lub stream z tego handlera),
 *  - powiadomienie e-mail (np. Resend) / wpis do CRM,
 *  - rate limiting + antyspam (np. Turnstile).
 */

const ACCEPTED_EXTENSIONS = [".step", ".stp", ".stl", ".iges", ".igs"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();

  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");
  const models = formData.getAll("models").filter((f): f is File => f instanceof File);

  if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
    return NextResponse.json(
      { error: "Brak wymaganych pól: name, email." },
      { status: 400 }
    );
  }

  for (const file of models) {
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Nieobsługiwany format pliku: ${file.name}` },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Plik ${file.name} przekracza 50 MB.` },
        { status: 400 }
      );
    }
  }

  // TODO(produkcja): upload do storage + notyfikacja. Na razie log serwerowy.
  console.log("[quote] nowe zgłoszenie:", {
    name,
    email,
    message: typeof message === "string" ? message.slice(0, 500) : "",
    files: models.map((f) => ({ name: f.name, size: f.size })),
  });

  return NextResponse.json({ ok: true });
}
