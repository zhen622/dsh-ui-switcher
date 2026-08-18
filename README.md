# DSH UI Switcher

[简体中文](README.zh-CN.md) | English

Automatically discovers DeepSeek Harness Web UI/theme plugins and lets you keep them installed while enabling only one at a time. Includes an **Original DSH** safety fallback and local custom display-name aliases.

## Install on Windows

Open **PowerShell** and run this single command:

```powershell
dsh plugin --profile web add "https://github.com/zhen622/dsh-ui-switcher.git"
```

Restart DSH Web after the first installation. Then open:

```text
Settings → Interface
```

Choose an installed UI or **Original DSH**, then refresh the browser page.

## Update

Update the installed package through DSH's pnpm forwarding command:

```powershell
dsh plugin --profile web update @dsh-external/dsh-ui-switcher
```

Restart DSH Web after updating if the new client bundle is not picked up automatically.

## How it works

- Detects installed packages with `skin.json` metadata, plus conservative `ui-skin`, `webui`, and `theme` package-name fallbacks.
- Reads Chinese/display names from plugin metadata and supports local aliases.
- Keeps every UI installed and controls Loader `disabled` overrides in the profile and home patch layers.
- Never edits third-party UI repositories.

See [README.zh-CN.md](README.zh-CN.md) and [docs/architecture.md](docs/architecture.md) for details and DSH `0.1.0-rc.7` limitations.

## Development

```powershell
npm install
npm run check
npm run build
```

## License

MIT. Third-party UI/theme plugins retain their own licenses.
