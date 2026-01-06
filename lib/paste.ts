import { Paste } from "@/types/paste";

export function isPasteAvailable(paste: Paste, now: number): boolean {
	if (paste.expires_at && now >= paste.expires_at) {
		return false;
	}

	// View limit check
	if (paste.max_views && paste.views >= paste.max_views) {
		return false;
	}

	return true;
}

export function getRemainingViews(paste: Paste): number | null {
	if (paste.max_views === null) {
		return null;
	}

	return Math.max(paste.max_views - paste.views, 0);
}

export function getExpiresAtISO(paste: Paste): string | null {
	if (paste.expires_at === null) {
		return null;
	}

	return new Date(paste.expires_at).toISOString();
}
