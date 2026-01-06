import {
	getExpiresAtISO,
	getRemainingViews,
	isPasteAvailable,
} from "@/lib/paste";
import { redis } from "@/lib/redis";
import { getNow } from "@/lib/time";
import { Paste } from "@/types/paste";
import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	{ params }: { params: { id: string } },
) {
	const { id } = params;
	const key = `paste:${id}`;

	const paste = await redis.get<Paste>(key);

	if (!paste) {
		return NextResponse.json({ error: "Paste not found" }, { status: 404 });
	}

	const now = getNow(req);

	// Check availability BEFORE increment (TTL)
	if (!isPasteAvailable(paste, now)) {
		return NextResponse.json(
			{ error: "Paste not available" },
			{ status: 404 },
		);
	}

	// Increment views
	const updatedPaste: Paste = {
		...paste,
		views: paste.views + 1,
	};

	// Check availability AFTER increment (view limit)
	if (
		updatedPaste.max_views !== null &&
		updatedPaste.views > updatedPaste.max_views
	) {
		return NextResponse.json(
			{ error: "Paste not available" },
			{ status: 404 },
		);
	}

	// Persist updated paste
	await redis.set(key, updatedPaste);

	return NextResponse.json({
		content: updatedPaste.content,
		remaining_views: getRemainingViews(updatedPaste),
		expires_at: getExpiresAtISO(updatedPaste),
	});
}
