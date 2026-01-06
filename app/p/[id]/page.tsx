import { isPasteAvailable } from "@/lib/paste";
import { redis } from "@/lib/redis";
import { getNow } from "@/lib/time";
import { Paste } from "@/types/paste";
import { notFound } from "next/navigation";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function PastePage({ params }: PageProps) {
	const { id } = await params;
	const key = `paste:${id}`;

	// Fetch paste
	const paste = await redis.get<Paste>(key);

	if (!paste) {
		notFound();
	}

	const now = getNow();

	// Check availability (TTL + views)
	if (!isPasteAvailable(paste, now)) {
		notFound();
	}

	return (
		<main style={{ padding: 24 }}>
			<h1>Paste</h1>

			<pre
				style={{
					marginTop: 16,
					padding: 16,
					background: "#f4f4f4",
					whiteSpace: "pre-wrap",
					wordBreak: "break-word",
				}}
			>
				{paste.content}
			</pre>
		</main>
	);
}
