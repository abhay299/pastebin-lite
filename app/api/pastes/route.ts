import { redis } from "@/lib/redis";
import { Paste } from "@/types/paste";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	let body: any;

	try {
		body = await req.json();
	} catch {
		return NextResponse.json(
			{ error: "Invalid JSON body" },
			{ status: 400 },
		);
	}

	const { content, ttl_seconds, max_views } = body;

	if (typeof content !== "string" || content.trim().length === 0) {
		return NextResponse.json(
			{ error: "content must be a non-empty string" },
			{ status: 400 },
		);
	}

	if (
		ttl_seconds !== undefined &&
		(!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
	) {
		return NextResponse.json(
			{ error: "ttl_seconds must be an integer >= 1" },
			{ status: 400 },
		);
	}

	if (
		max_views !== undefined &&
		(!Number.isInteger(max_views) || max_views < 1)
	) {
		return NextResponse.json(
			{ error: "max_views must be an integer >= 1" },
			{ status: 400 },
		);
	}

	const id = crypto.randomUUID();
	const now = Date.now();

	const expires_at =
		ttl_seconds !== undefined ? now + ttl_seconds * 1000 : null;

	const paste: Paste = {
		id,
		content,
		created_at: now,
		expires_at,
		max_views: max_views ?? null,
		views: 0,
	};

	const key = `paste:${id}`;

	if (ttl_seconds !== undefined) {
		await redis.set(key, paste, { ex: ttl_seconds });
	} else {
		await redis.set(key, paste);
	}

	const origin = req.headers.get("origin") ?? "";

	return NextResponse.json(
		{
			id,
			url: `${origin}/p/${id}`,
		},
		{ status: 201 },
	);
}
