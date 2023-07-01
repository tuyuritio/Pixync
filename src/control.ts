import { input, select } from "@inquirer/prompts";
import { bold, gray, green, greenBright, red, yellowBright } from "chalk";
import Table from "cli-table3";
import $ from "./lib/event";
import Pixiv from "./lib/pixiv";
import { Introduce, Log } from "./lib/output";
import Profile from "./profile";
import File from "./lib/file";

const $$ = {
	introduce: Symbol(),
	profile: {
		check: Symbol(),
		initialize: Symbol()
	},
	pixiv: {
		initialize: Symbol()
	}
}
export default $$;

$.on($$.introduce, Introduce);
$.on($$.profile.check, Profile.check);
$.on($$.profile.initialize, Configure);
$.on($$.pixiv.initialize, () => Pixiv.initialize({ proxy: Profile.proxy, PHPSESSID: Profile.PHPSESSID }));

async function Configure() {
	let proxy;
	await input({
		message: "【配置】 代理地址：",
		default: "留空跳过",
		validate: (value) => {
			let proxy_array = value.match(/^(?:(https?|socks4|socks5):\/\/)?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|[a-zA-Z0-9-.]+):(\d{1,5})$/i);;
			if (proxy_array) {
				let protocol = proxy_array[1]?.toLowerCase();
				let host = proxy_array[2];
				let port = Number(proxy_array[3]);

				proxy = { host, port, protocol };
				Pixiv.initialize({ proxy });

				return true;
			} else if (value == "留空跳过") {
				return true;
			} else {
				return "代理地址无效！";
			}
		}
	});

	let cookie = await input({
		message: "【配置】 Pixiv Cookie：",
		default: `PHPSESSID=${bold`<Cookie>`}`,
		validate: async (value) => await Pixiv.verify(value) ? "请输入有效 Cookie ！" : true
	});

	let directory = await input({
		message: "【配置】 存储路径：",
		default: `./Illustration`
	});

	let delay = Number(await input({
		message: "【配置】 下载延迟间隔：",
		default: "1000"
	}));

	return { proxy, cookie, directory, delay };
}

export async function Main() {
	let action: any;
	while (action = await select({
		message: "【菜单】",
		choices: [
			{ name: "索引", value: Main.Index },
			{ name: "同步", value: Main.Synchronize, disabled: Main.index ? false : `（请先进行${bold`索引`}）` },
			{ name: "配置", value: null, disabled: "🚧" },
			{ name: "导出", value: null, disabled: "🚧" },
			{ name: "退出", value: null }
		]
	})) await action?.();
}

export namespace Main {
	export let index: { insert: number[], remove: number[], reject: number[]; };

	export async function Index() {
		Log("=", "索引", "……");
		const index_table = new Table({ head: ["", green.bold`可见`, red.bold`锁定`], colAligns: ["center", "center", "center"] });
		let { show, hide } = await Pixiv.bookmarkList();

		index_table.push(["公开", show.visible.length, show.invalid.length]);
		index_table.push(["私密", hide.visible.length, hide.invalid.length]);

		Log("+", "索引", "详情：");
		console.log(index_table.toString());

		Log("=", "比对", "……");
		let collection = Pixiv.localList(File.readDirectory(Profile.directory));
		let result = index = await Pixiv.compare(show.visible.concat(hide.visible), show.invalid.concat(hide.invalid), collection);

		const compare_table = new Table();
		compare_table.push(
			{ 新增: result.insert.length },
			{ 遗留: result.remove.length },
			{ 锁定: result.reject.length }
		);

		Log("+", "比对", "详情：");
		console.log(compare_table.toString());
	}

	export async function Synchronize() {
		let action: any;
		action = await select({
			message: "【操作】",
			choices: [
				{ name: "缺省", value: () => { Synchronize.Insert(); Synchronize.Remove() }, description: gray`进行${bold`下载`}和${bold`移除`}，但不${bold`销毁`}。` },
				{ name: "下载", value: Synchronize.Insert },
				{ name: "移除", value: Synchronize.Remove },
				{ name: "销毁", value: Synchronize.Reject, description: gray`删除被${bold`锁定`}的文件。` },
				{ name: "返回", value: null }
			]
		});
		await action?.();
	}

	export namespace Synchronize {
		export async function Insert() {
			let wait: Promise<any>[] = [];
			while (index.insert.length) {
				await sleep(Profile.delay);
				let ID: number = index.insert.pop()!;

				Log("=", "下载", `${ID} ……`);
				wait.push(Pixiv.fetch(ID, Profile.delay).then((illustrations) => {
					for (const illustration of illustrations) File.writeBuffer(File.join(Profile.directory, illustration.file), illustration.data);
					Log("+", "下载", `${ID} 完成。`);
				}).catch((error) => {
					Log("!!", "报错", `${ID} ${error.request?.res.statusCode || error}`);
					index.insert.push(ID);
				}));
			}
			await Promise.all(wait);
		}

		export function Remove() {
			for (const file of File.readDirectory(Profile.directory)) {
				let i: number;
				if ((i = index.remove.findIndex((value) => file.startsWith(`illust_${value}`))) + 1) {
					File.remove(File.join(Profile.directory, file));
					Log("+", "移除", `${index.remove[i]}`);
				}
			}
		}

		export function Reject() {
			for (const file of File.readDirectory(Profile.directory)) {
				let i: number;
				if ((i = index.reject.findIndex((value) => file.startsWith(`illust_${value}`))) + 1) {
					File.remove(File.join(Profile.directory, file));
					Log("+", "销毁", `${index.reject[i]}`);
				}
			}
		}
	}
}
