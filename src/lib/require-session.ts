import { redirect } from "next/navigation";
import { getSession } from "./session";

export async function requireSession() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/login");
  }
  return session;
}

/**
 * Wie requireSession(), verlangt zusätzlich die Benutzergruppe "ADMIN".
 * Nicht-Admins werden zur Übersichtsseite der Familienmitglieder
 * zurückgeschickt (nicht zum Login, sie sind ja angemeldet).
 */
export async function requireAdmin() {
  const session = await requireSession();
  if (session.userRole !== "ADMIN") {
    redirect("/users");
  }
  return session;
}
