import HTTP from "axios";
import AdmZip from "adm-zip";
import ImageSize from "image-size";
import GIFEncoder from "gifencoder";
import { createCanvas, Image } from "canvas";

namespace PixivUtil {
	export const sleep = async (millisecond: number) => await new Promise((resolve) => setTimeout(() => resolve(true), millisecond));

	export type Illustration = {
		ID: number;
		type: "image" | "ugoira";
		file?: string;
	};

	export async function illustrationURLs(ID: number) {
		let response = (await HTTP.get(`https://www.pixiv.net/ajax/illust/${ID}`)).data;

		let count: number = response.body.pageCount;
		let URL: string = response.body.urls.original;

		let URLs: string[] = [];
		for (let index = 0; index < count; index++) URLs.push(URL.replace(/_p\d+/, `_p${index}`));

		return URLs;
	}

	export async function download(URL: string) {
		let response = (await HTTP.get(URL, { responseType: "arraybuffer" })).data;
		return response;
	}

	export function unZIP(data: Buffer) {
		let zip = new AdmZip(Buffer.from(data));
		let files = zip.getEntries().map((entry) => zip.readFile(entry)!);

		return files;
	}

	export async function bookmarkListSection(UserID: string, offset: number, limit: number = 100, rest: "show" | "hide" = "show") {
		let response = (await HTTP.get(`https://www.pixiv.net/ajax/user/${UserID}/illusts/bookmarks?tag=&offset=${offset}&limit=${limit}&rest=${rest}`)).data;
		return response;
	}

	export function compressGIF(pictures: Buffer[]) {
		let { width, height } = ImageSize(pictures[0]);

		const GIF = new GIFEncoder(width!, height!);
		GIF.start();
		GIF.setRepeat(0);
		GIF.setDelay(150);
		GIF.setQuality(100);

		var canvas = createCanvas(width!, height!);
		var context = canvas.getContext("2d");

		for (const picture of pictures) {
			const image = new Image();
			image.src = picture;
			context.drawImage(image, 0, 0, width!, height!);

			GIF.addFrame(<any>context);
		}

		GIF.finish();
		return GIF.out.getData();
	}
}

export namespace Pixiv {
	let user_ID: string;

	export async function verify(PHPSESSID: string) {
		try {
			let response = (await HTTP.get(`https://www.pixiv.net`, { headers: { Cookie: `PHPSESSID=${PHPSESSID};` } })).data;
			return response.includes("This site is protected by reCAPTCHA Enterprise");
		} catch (error) {
			return false;
		}
	}

	export function initialize({ PHPSESSID, proxy }: { PHPSESSID?: string; proxy?: PROXY; }) {
		if (proxy) HTTP.defaults.proxy = { host: proxy.host, port: proxy.port, protocol: proxy.protocol };

		if (PHPSESSID) {
			HTTP.defaults.headers["Cookie"] = `PHPSESSID=${PHPSESSID};`;
			user_ID = PHPSESSID.split("_")[0];
		}

		HTTP.defaults.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.58";
		HTTP.defaults.headers["Referer"] = "https://www.pixiv.net/";
	}

	export async function bookmarkList() {
		async function List(type: "show" | "hide") {
			let information = await PixivUtil.bookmarkListSection(user_ID, 0, 1, type);

			let wait: Promise<any>[] = [];
			let result: { visible: number[], invalid: number[] } = { visible: [], invalid: [] };
			for (let offset = 0; offset < information.body.total; offset += 100) {
				wait.push(PixivUtil.bookmarkListSection(user_ID, offset, 100, type).then((data) => {
					for (const illustration of data.body.works) (typeof illustration.id == "string" ? result.visible : result.invalid).push(Number(illustration.id));
				}));
			}
			await Promise.all(wait);

			return result;
		}

		let show = await List("show");
		let hide = await List("hide");

		return { show, hide };
	}

	export function localList(files: string[]) {
		let collection: number[] = [];

		for (const file of files) {
			if (file.startsWith("illust_")) {
				let items: string[] = file.split(".")[0].split("_");
				let ID: string = items[1];
				collection.push(Number(ID));
			}
		}

		return collection;
	}

	export async function compare(visible: number[], invalid: number[], collection: number[]) {
		const insert: number[] = [];
		const remove: number[] = [];
		const reject: number[] = [];

		collection.forEach((id) => visible.includes(id) || remove.push(id));
		collection.forEach((id) => invalid.includes(id) && reject.push(id));
		visible.forEach((id) => collection.includes(id) || insert.push(id));

		return { insert, remove, reject };
	}

	export async function fetch(ID: number, delay: number): Promise<{ file: string; data: Buffer; }[]> {
		let URLs = await PixivUtil.illustrationURLs(ID);

		async function Pack(URL: string): Promise<{ file: string; data: Buffer; }> {
			await PixivUtil.sleep(delay);

			let file: string;
			let data: Buffer;

			if (URL.includes("_ugoira")) {		// 动图
				let ZIP = await PixivUtil.download(URL = URL.replace("img-original", "img-zip-ugoira").replace(/_ugoira0.\w*/, "_ugoira1920x1080.zip"));

				let images = PixivUtil.unZIP(ZIP);

				file = `illust_${URL.match(/.*\/(\d+)_ugoira1920x1080.zip/)![1]}.gif`;
				data = PixivUtil.compressGIF(images);
			} else {
				file = `illust_${URL.match(/.*\/(.*_p\d+.\w+)/)![1]}`;
				data = await PixivUtil.download(URL);
			}

			return { file, data };
		}

		let illustrations: Promise<{ file: string; data: Buffer; }>[] = [];
		for (const URL of URLs) illustrations.push(Pack(URL));
		return await Promise.all(illustrations);
	}
}

export default Pixiv;
