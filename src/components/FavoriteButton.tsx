import { toggleFavoriteAction } from "@/app/favorites/actions";

type Props = {
  listingSlug: string;
  isSaved: boolean;
  isSignedIn: boolean;
  /**
   * "icon" = just the heart (compact, for cards)
   * "label" = heart + text (prominent, for detail pages)
   */
  variant?: "icon" | "label";
  className?: string;
};

export function FavoriteButton({
  listingSlug,
  isSaved,
  isSignedIn,
  variant = "icon",
  className,
}: Props) {
  // Anonymous visitors don't see the button. They can sign up to save.
  if (!isSignedIn) return null;

  if (variant === "icon") {
    return (
      <form action={toggleFavoriteAction}>
        <input type="hidden" name="slug" value={listingSlug} />
        <button
          type="submit"
          aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
          title={isSaved ? "Remove from favorites" : "Save to favorites"}
          className={`grid h-9 w-9 place-items-center rounded-full ring-1 ring-slate-200 bg-white text-lg shadow-sm transition hover:bg-rose-50 ${
            isSaved ? "text-rose-600" : "text-slate-400"
          } ${className ?? ""}`}
        >
          <span aria-hidden>{isSaved ? "♥" : "♡"}</span>
        </button>
      </form>
    );
  }

  return (
    <form action={toggleFavoriteAction}>
      <input type="hidden" name="slug" value={listingSlug} />
      <button
        type="submit"
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ring-1 transition ${
          isSaved
            ? "bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100"
            : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
        } ${className ?? ""}`}
      >
        <span aria-hidden>{isSaved ? "♥" : "♡"}</span>
        <span>{isSaved ? "Saved" : "Save listing"}</span>
      </button>
    </form>
  );
}
