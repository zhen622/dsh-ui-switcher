# DSH UI Switcher（DSH 界面切换器）

[English](README.md) | 简体中文

自动发现 DeepSeek Harness Web 已安装的 UI/主题插件。在不卸载插件的情况下保证一次只启用一个界面，并提供“DSH 原版界面”安全回退和本地中文别名。

## 安装

### 快速安装

直接告诉 DSH：

```text
安装这个插件包：https://github.com/zhen622/dsh-ui-switcher
```

### 手动安装

```powershell
git clone https://github.com/zhen622/dsh-ui-switcher.git
cd dsh-ui-switcher
dsh plugin --profile web add .
```

首次安装后重启 DSH Web，然后进入：

```text
设置 → 界面切换
```

选择某个已安装界面或“DSH 原版界面”，再刷新浏览器页面即可。

## 更新

通过 DSH 转发的 pnpm 更新命令更新已安装包：

```powershell
dsh plugin --profile web update @dsh-external/dsh-ui-switcher
```

如果 DSH 没有自动加载新的 client bundle，更新后重启一次 DSH Web。

## 功能

- 自动扫描当前 Web profile 中带 `skin.json` 的 UI/Theme 包。
- 缺少 manifest 时，保守识别包名含 `ui-skin`、`webui` 或 `theme` 的插件。
- 中文名称优先读取 `skin.json` 的 `name`，其次读取 package metadata；也可设置本地别名。
- 列表固定包含“DSH 原版界面”，用于禁用所有已识别的第三方 UI。
- 不卸载 UI，不修改第三方 UI 仓库。

## 工作方式与已知限制

- DSH `0.1.0-rc.7` 的插件清单 API 是只读接口，没有公开的运行时 enable/disable RPC。
- 本插件在 profile 和 home 两层 `cordis.patch.yml` 末尾维护带边界标记的独立区块，并保留区块以外的原配置。
- Loader 配置 HMR 会卸载旧皮肤并挂载新皮肤；切换后仍建议刷新浏览器。
- 首次安装或新增 UI 包仍由 DSH 插件管理器完成，通常需要重启 DSH Web 才能把新的 client bundle 加入启动清单；无需重新安装切换器。
- 只有实现完整 `ctx.effect` 清理生命周期的皮肤才适合无残留热切换。未知皮肤出现残留时，请刷新页面或重启 DSH Web。

技术说明见 [docs/architecture.md](docs/architecture.md)。

## 许可证

切换器使用 MIT 许可证。被发现和切换的第三方 UI/主题仍适用其各自许可证。
