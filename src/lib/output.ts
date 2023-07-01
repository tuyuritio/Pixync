import Figlet from "figlet";
import { bold, italic, underline, red, green, greenBright, blue, yellow, yellowBright, gray } from "chalk";

export async function Introduce() {
	const Banner = (text: string) => new Promise((resolve) => Figlet(text, { font: "DOS Rebel", width: 80, showHardBlanks: true }, (error, result) => resolve(result)));

	console.log(yellow.bold`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                       ┃
┃                                                                       ┃
┃    ███████████   ███                                                  ┃
┃    ░░███░░░░░███ ░░░                                                  ┃
┃     ░███    ░███ ████  █████ █████ █████ ████ ████████    ██████      ┃
┃     ░██████████ ░░███ ░░███ ░░███ ░░███ ░███ ░░███░░███  ███░░███     ┃
┃     ░███░░░░░░   ░███  ░░░█████░   ░███ ░███  ░███ ░███ ░███ ░░░      ┃
┃     ░███         ░███   ███░░░███  ░███ ░███  ░███ ░███ ░███  ███     ┃
┃     █████        █████ █████ █████ ░░███████  ████ █████░░██████      ┃
┃    ░░░░░        ░░░░░ ░░░░░ ░░░░░   ░░░░░███ ░░░░ ░░░░░  ░░░░░░       ┃
┃                                     ███ ░███                          ┃
┃                                    ░░██████                           ┃
┃                                     ░░░░░░                            ┃
┃                                                                       ┃
┃                         ${italic`同步`} 您的 Pixiv 收藏！                        ┃
┃                                                                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`);
}

export function Log(action: "+" | "=" | "-" | "!" | "!!", theme: string, message: string) {
	const color = {
		"+": green`+`,
		"=": `=`,
		"-": red`-`,
		"!": yellow`!`,
		"!!": red`!`
	};

	console.log(`${color[action]} ${bold`【${theme}】 `}${message}`);
}
