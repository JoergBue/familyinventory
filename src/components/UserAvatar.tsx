// Bewusst eine "universelle" Komponente ohne "use client" - wird sowohl aus
// Server-Komponenten (Root-Layout, Familienmitglieder-Liste) als auch aus
// Client-Komponenten (AvatarUploadForm) heraus verwendet und braucht dafür
// selbst keine Client-Hooks.

export function UserAvatar({
  name,
  avatarUrl,
  size = 32,
}: {
  name: string | null | undefined;
  avatarUrl: string | null | undefined;
  size?: number;
}) {
  const initial = (name ?? "").trim().charAt(0).toUpperCase() || "?";
  const style = { width: size, height: size };

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        style={style}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      style={style}
      className="flex shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600"
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
