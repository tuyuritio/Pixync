declare global {
	type PROXY = { host: string, port: number, protocol?: string };

	function sleep(millisecond: number): Promise<boolean>;
}

global.sleep = async (millisecond: number) => await new Promise((resolve) => setTimeout(() => resolve(true), millisecond));

export default this;
