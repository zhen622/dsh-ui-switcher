# DSH UI Switcher

[简体中文](README.zh-CN.md) | English

Automatically discovers DeepSeek Harness Web UI/theme plugins and lets you keep them installed while enabling only one at a time. Includes an **Original DSH** safety fallback and local custom display-name aliases.

## Install on Windows

Open **Command Prompt (CMD)** and run:

```cmd
cd /d D:\Github
git clone https://github.com/zhen622/dsh-ui-switcher.git
cmd /c "dsh plugin --profile web add D:\Github\dsh-ui-switcher"
```

Restart DSH Web after the first installation. Then open:

```text
Settings → Interface
```

Choose an installed UI or **Original DSH**, then refresh the browser page.

If you cloned the repository somewhere else, replace `D:\Github\dsh-ui-switcher` with its actual local path.

## Update

```cmd
cd /d D:\Github\dsh-ui-switcher
git pull --ff-only
```

Restart DSH Web after updating if the new client bundle is not picked up automatically.

## How it works

- Detects installed packages with `skin.json` metadata, plus conservative `ui-skin`, `webui`, and `theme` package-name fallbacks.
- Reads Chinese/display names from plugin metadata and supports local aliases.
- Keeps every UI installed and controls Loader `disabled` overrides in the profile and home patch layers.
- Never edits third-party UI repositories.

See [README.zh-CN.md](README.zh-CN.md) and [docs/architecture.md](docs/architecture.md) for details and DSH `0.1.0-rc.7` limitations.

## Development

```cmd
npm install
npm run check
npm run build
```

## License

MIT. Third-party UI/theme plugins retain their own licenses.
