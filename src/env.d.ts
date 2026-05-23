declare module "*.html" {
	const value: string;
	export default value;
}

declare module "*.jpg" {
	const value: ArrayBuffer;
	export default value;
}

declare module "*.png" {
	const value: ArrayBuffer;
	export default value;
}
