import "./lib/global";
import $ from "./lib/event";
import $$, { Main } from "./control";

!async function () {
	await $.do($$.introduce);
	await $.do($$.profile.check);
	await $.do($$.pixiv.initialize);
	await Main();
}();
