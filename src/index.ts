import homeHtml from "./home.html";
import photo from "./photo.jpg";

export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/photo.jpg") {
			return new Response(photo, {
				headers: {
					"content-type": "image/jpeg",
					"cache-control": "public, max-age=86400",
				},
			});
		}

		return new Response(homeHtml, {
			headers: {
				"content-type": "text/html; charset=UTF-8",
				"cache-control": "public, max-age=3600",
			},
		});
	},
} satisfies ExportedHandler;
