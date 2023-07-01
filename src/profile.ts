import $ from "./lib/event";
import $$ from "./control";
import File from "./lib/file";
import { Log } from "./lib/output";

export namespace Profile {
	type PROFILE = {
		/**
		 * 代理配置
		 */
		proxy?: PROXY,

		/**
		 * Pixiv Cookie
		 * @type string
		 */
		PHPSESSID: string,

		/**
		 * 图片存放路径
		 * @type string
		 */
		directory: string,

		/**
		 * 单张图片获取延迟
		 * @type number
		 */
		delay: number
	};

	const FILE = "profile.json";
	let data: PROFILE;

	export let proxy: PROXY | undefined;
	export let PHPSESSID: string;
	export let directory: string;
	export let delay: number;
	export let user_ID: string;

	export async function check() {
		Log("=", "启动", "检测配置……");

		if (!File.exist(FILE)) {
			Log("=", "配置", "初始化……");

			let profile = await $.do($$.profile.initialize);
			File.write(FILE, JSON.stringify({ proxy: profile.proxy, PHPSESSID: profile.cookie, directory: profile.directory, delay: profile.delay }));

			Log("+", "配置", "已写入本地。");
		}

		try {
			let profile = File.read(FILE);
			data = JSON.parse(profile);

			proxy = data.proxy;
			PHPSESSID = data.PHPSESSID;
			directory = data.directory;
			delay = data.delay;
			user_ID = PHPSESSID.split("_")[0];

			if (!File.exist(directory)) File.makeDirectory(directory);
		} catch (error) {
			console.error(error);
			File.remove(FILE);
			Log("!!", "配置", "配置文件异常，现已删除，请重启程序！");
		}

		Log("=", "启动", "配置检测完成。");
	}
}

export default Profile;
