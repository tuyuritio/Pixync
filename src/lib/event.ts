import EventEmitter from "events";

const watcher = new EventEmitter();
const emitter = new EventEmitter();

const $ = {
	on: (event: symbol, callback: (...args: any[]) => any) => emitter.on(event, () => watcher.emit(event, callback())),
	do: (event: symbol, ...args: any[]) => new Promise<any>((resolve) => { watcher.on(event, (result) => resolve(result)); emitter.emit(event, ...args); })
};

export default $;
