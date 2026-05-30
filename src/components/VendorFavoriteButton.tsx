import { toggleVendorFavoriteAction } from "@/app/account/dashboard-actions";

type Props = {
  vendorId: string;
  vendorName?: string | null;
  vendorCategory?: string | null;
  isSaved: boolean;
  isSignedIn: boolean;
  /** Where to return after toggling (so the heart state refreshes in place). */
  redirectTo?: string;
  className?: string;
};

export function VendorFavoriteButton({
  vendorId,
  vendorName,
  vendorCategory,
  isSaved,
  isSignedIn,
  redirectTo,
  className,
}: Props) {
  if (!isSignedIn) return null;

  return (
    <form action={toggleVendorFavoriteAction}>
      <input type="hidden" name="vendor_id" value={vendorId} />
      {vendorName ? (
        <input type="hidden" name="vendor_name" value={vendorName} />
      ) : null}
      {vendorCategory ? (
        <input type="hidden" name="vendor_category" value={vendorCategory} />
      ) : null}
      {redirectTo ? (
        <input type="hidden" name="redirect_to" value={redirectTo} />
      ) : null}
      <button
        type="submit"
        aria-label={isSaved ? "Remove vendor from favorites" : "Save vendor to favorites"}
        title={isSaved ? "Remove from favorites" : "Save to favorites"}
        className={`grid h-9 w-9 place-items-center rounded-full bg-white text-lg shadow-sm ring-1 ring-slate-200 transition hover:bg-rose-50 ${
          isSaved ? "text-rose-600" : "text-slate-400"
        } ${className ?? ""}`}
      >
        <span aria-hidden>{isSaved ? "♥" : "♡"}</span>
      </button>
    </form>
  );
}
