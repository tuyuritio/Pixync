import * as Path from "path";
import * as FileSystem from "fs";

export namespace File {
	/**
	 * 判断路径是否存在
	 * @param path 路径
	 * @returns 路径是否存在
	 */
	export function exist(path: string): boolean {
		return FileSystem.existsSync(path);
	}

	/**
	 * 连接路径
	 * @param paths 路径集合
	 * @returns 路径字符串
	 */
	export function join(...paths: string[]): string {
		return Path.join(...paths);
	}

	/**
	 * 在指定路径创建目录
	 * @param path 目录路径
	 */
	export function makeDirectory(path: string): void {
		FileSystem.mkdirSync(path);
	}

	/**
	 * 读取指定目录
	 * @param path 目录路径
	 */
	export function readDirectory(path: string): string[] {
		return FileSystem.readdirSync(path);
	}

	/**
	 * 读取文件内容
	 * @param path 文件路径
	 * @returns 文件内容
	 */
	export function read(path: string): string {
		return FileSystem.readFileSync(path).toString();
	}

	/**
	 * 以 Buffer 方式读取文件
	 * @param path 文件路径
	 * @returns 文件内容
	 */
	export function readBuffer(path: string): Buffer {
		return FileSystem.readFileSync(path);
	}

	/**
	 * 在文件中写入数据
	 * @param path 文件路径
	 * @param data 数据
	 */
	export function write(path: string, data: string, encoding?: BufferEncoding): void {
		FileSystem.writeFileSync(path, Buffer.from(data, encoding));
	}

	/**
	 * 以 Buffer 方式在文件中写入数据
	 * @param path 文件路径
	 * @param data 数据
	 */
	export function writeBuffer(path: string, data: Buffer): void {
		FileSystem.writeFileSync(path, data);
	}

	/**
	 * 删除文件
	 * @param path 文件路径
	 */
	export function remove(path: string): void {
		FileSystem.unlinkSync(path);
	}

	/**
	 * 删除文件夹
	 * @param path 文件路径
	 */
	export function removeDirectory(path: string): void {
		FileSystem.rmSync(path, { recursive: true, force: true });
	}

	/**
	 * 移动文件
	 * @param old_path 原路径
	 * @param new_path 新路径
	 */
	export function move(old_path: string, new_path: string): void {
		FileSystem.renameSync(old_path, new_path);
	}

	export function information(path: string): FileSystem.Stats {
		return FileSystem.statSync(path);
	}
}
export default File;
