import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    "Modelleisenbahn",
    "Schmuck",
    "Boot-Inventar",
    "Elektronik",
    "Werkzeug",
    "Sonstiges",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const todoAreas = ["Haushalt", "Garten", "Reparaturen", "Sonstiges"];

  for (const name of todoAreas) {
    await prisma.todoArea.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Erster Benutzer zum Testen des Logins.
  // WICHTIG: Passwort nach dem ersten Login ändern (Passwort-Änderung folgt
  // als eigene Funktion) und hier bei Bedarf um weitere Familienmitglieder
  // ergänzen (einfach kopieren und anpassen, dann `npx prisma db seed`).
  const passwordHash = await bcrypt.hash("aendern123", 12);
  await prisma.user.upsert({
    where: { email: "joerg@buenning.me" },
    // Stellt sicher, dass dieser Account immer Admin bleibt (z.B. nach
    // Einführung der Benutzergruppen) - Passwort wird beim Update NICHT
    // angefasst, nur bei einer echten Neuanlage gesetzt.
    update: { role: "ADMIN" },
    create: {
      name: "Jörg",
      email: "joerg@buenning.me",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(
    `Fertig: ${categories.length} Kategorien, ${todoAreas.length} ToDo-Bereiche und Testbenutzer angelegt.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
