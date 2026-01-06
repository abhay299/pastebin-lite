"use client";

import { useState } from "react";

export default function Home() {
	const [content, setContent] = useState("");
	const [ttlSeconds, setTtlSeconds] = useState("");
	const [maxViews, setMaxViews] = useState("");
	const [resultUrl, setResultUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setResultUrl(null);

		if (!content.trim()) {
			setError("Content cannot be empty");
			return;
		}

		const payload: any = { content };
		if (ttlSeconds) payload.ttl_seconds = Number(ttlSeconds);
		if (maxViews) payload.max_views = Number(maxViews);

		setLoading(true);

		try {
			const res = await fetch("/api/pastes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error ?? "Failed to create paste");
				return;
			}

			setResultUrl(data.url);
			setContent("");
			setTtlSeconds("");
			setMaxViews("");
		} catch {
			setError("Network error");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main
			style={{
				maxWidth: 720,
				margin: "40px auto",
				background: "#ffffff",
				padding: 24,
				borderRadius: 8,
				boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
			}}
		>
			<h1 style={{ marginBottom: 8 }}>Pastebin Lite</h1>
			<p style={{ marginBottom: 16, color: "#4b5563" }}>
				Create a text paste and share the link.
			</p>

			<form onSubmit={handleSubmit}>
				<textarea
					rows={10}
					placeholder="Paste your text here..."
					value={content}
					onChange={(e) => setContent(e.target.value)}
					style={{
						width: "100%",
						padding: 12,
						borderRadius: 6,
						border: "1px solid #d1d5db",
						fontSize: 14,
					}}
				/>

				<div style={{ display: "flex", gap: 16, marginTop: 16 }}>
					<div>
						<label style={{ fontSize: 14 }}>TTL (seconds)</label>
						<input
							type="number"
							min="1"
							value={ttlSeconds}
							onChange={(e) => setTtlSeconds(e.target.value)}
							style={inputStyle}
						/>
					</div>

					<div>
						<label style={{ fontSize: 14 }}>Max views</label>
						<input
							type="number"
							min="1"
							value={maxViews}
							onChange={(e) => setMaxViews(e.target.value)}
							style={inputStyle}
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={loading}
					style={{
						marginTop: 20,
						background: "#2563eb",
						color: "#ffffff",
						border: "none",
						padding: "10px 16px",
						borderRadius: 6,
						cursor: "pointer",
						fontSize: 14,
						opacity: loading ? 0.7 : 1,
					}}
				>
					{loading ? "Creating..." : "Create Paste"}
				</button>
			</form>

			{error && (
				<p style={{ marginTop: 16, color: "#dc2626" }}>{error}</p>
			)}

			{resultUrl && (
				<div
					style={{
						marginTop: 20,
						padding: 12,
						background: "#f0fdf4",
						border: "1px solid #86efac",
						borderRadius: 6,
					}}
				>
					<strong>Paste created:</strong>
					<br />
					<a
						href={resultUrl}
						target="_blank"
						rel="noreferrer"
						style={{ color: "#166534" }}
					>
						{resultUrl}
					</a>
				</div>
			)}
		</main>
	);
}

const inputStyle: React.CSSProperties = {
	display: "block",
	width: "100%",
	marginTop: 4,
	padding: 8,
	borderRadius: 6,
	border: "1px solid #d1d5db",
	fontSize: 14,
};
