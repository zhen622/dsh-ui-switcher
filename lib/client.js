window.__ModuleLoader__.load({
	id: "@dsh-external/dsh-ui-switcher",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		//#region src/client/index.ts
		const inject = ["slots", "locale"];
		const NS = "uiSwitcher";
		const API = "/api/dsh-ui-switcher";
		const zh = {
			nav: "界面切换",
			original: "DSH 原版界面",
			originalHint: "禁用所有第三方 UI，作为安全回退",
			refresh: "切换已保存，请刷新页面",
			alias: "自定义名称",
			save: "保存",
			loading: "正在扫描已安装界面…",
			error: "操作失败"
		};
		const en = {
			nav: "Interface",
			original: "Original DSH",
			originalHint: "Disable all third-party UIs as a safe fallback",
			refresh: "Saved. Refresh the page to finish switching.",
			alias: "Custom name",
			save: "Save",
			loading: "Scanning installed interfaces…",
			error: "Operation failed"
		};
		async function request(input) {
			const response = await fetch(API, input ? {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(input)
			} : void 0);
			const value = await response.json();
			if (!response.ok) throw new Error(value.error ?? response.statusText);
			return value;
		}
		function Switcher({ t }) {
			const [state, setState] = (0, react.useState)();
			const [notice, setNotice] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const load = (0, react.useCallback)(() => request().then(setState).catch((e) => setNotice(`${t("error")}: ${e.message}`)), [t]);
			(0, react.useEffect)(() => {
				load();
			}, [load]);
			const choose = async (id) => {
				setBusy(true);
				setNotice("");
				try {
					await request({
						action: "switch",
						id
					});
					setState((old) => old ? {
						...old,
						active: id
					} : old);
					setNotice(t("refresh"));
				} catch (e) {
					setNotice(`${t("error")}: ${e instanceof Error ? e.message : String(e)}`);
				} finally {
					setBusy(false);
				}
			};
			const alias = async (skin) => {
				const value = window.prompt(t("alias"), skin.alias ?? skin.name);
				if (value === null) return;
				await request({
					action: "alias",
					id: skin.id,
					alias: value
				});
				await load();
			};
			if (!state) return react.default.createElement("p", null, notice || t("loading"));
			const item = (id, title, hint, skin) => react.default.createElement("div", {
				key: id,
				style: {
					padding: "14px 0",
					borderBottom: "1px solid var(--dsw-alias-line-border-subtle, #ddd)"
				}
			}, react.default.createElement("label", { style: {
				display: "flex",
				gap: 10,
				cursor: "pointer",
				alignItems: "flex-start"
			} }, react.default.createElement("input", {
				type: "radio",
				name: "dsh-ui",
				checked: state.active === id,
				disabled: busy,
				onChange: () => void choose(id)
			}), react.default.createElement("span", null, react.default.createElement("strong", null, title), react.default.createElement("small", { style: {
				display: "block",
				opacity: .7,
				marginTop: 4
			} }, hint))), skin && react.default.createElement("button", {
				type: "button",
				onClick: () => void alias(skin),
				style: { margin: "8px 0 0 26px" }
			}, t("alias")));
			return react.default.createElement("section", null, item("original", t("original"), t("originalHint")), ...state.skins.map((skin) => item(skin.id, skin.alias || skin.name, `${skin.nameEn ?? ""}${skin.nameEn ? " · " : ""}${skin.packageName}`, skin)), notice && react.default.createElement("p", {
				role: "status",
				style: { marginTop: 16 }
			}, notice));
		}
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-ui-switcher: dictionaries");
			const t = ctx.locale.bind(NS);
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "ui-switcher",
				order: 12,
				label: () => t("nav"),
				locale: NS
			}, Switcher));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map