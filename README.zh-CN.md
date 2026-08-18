# DSH UI Switcher

DeepSeek Harness Web 的本地界面切换插件。它自动扫描当前 `web` profile 中带 `skin.json` 的 UI/Theme 包，在 DSH 设置中增加“界面切换”，并通过 Loader 的 `disabled` 配置保证同一时间只启用一个界面。

## 安装

```powershell
dsh plugin --profile web add D:\Github\dsh-ui-switcher
```

首次安装插件需要重启 DSH Web。此后安装新 UI 后只需按该 UI 的要求重启或刷新；切换器会自动发现，不需要重新导入。

## 使用

打开 DSH → 设置 → 界面切换。选择一个界面或“DSH 原版界面”，保存后刷新网页。可为每个自动发现的界面设置本地中文别名。

## 工作方式与限制

- DSH rc.7 的插件清单 API 是只读接口，没有公开的运行时 enable/disable RPC。
- 本插件不卸载 UI，而是在 profile 和 home 两层 `cordis.patch.yml` 末尾维护带边界标记的独立区块。Loader 配置 HMR 会卸载旧皮肤并挂载新皮肤；刷新页面是推荐的收尾动作。
- 首次安装/新增包仍由 DSH 插件管理器完成，通常需要重启 DSH Web 才能把新的 client bundle 加入启动清单。
- 只有实现完整 `ctx.effect` 清理生命周期的皮肤才适合无残留热切换。未知皮肤发生残留时，请刷新页面或重启 DSH Web，并向皮肤作者报告。
- 自动识别优先使用 `skin.json` 的 `wiring.id`、`name`、`nameEn`；缺少 manifest 时只对包名含 `ui-skin`、`webui` 或 `theme` 的依赖作保守候选识别。
- API 是同源本机端点，不接受任意文件路径；写入采用临时文件后原子替换。

更多技术细节见 [docs/architecture.md](docs/architecture.md)。
