# Architecture

The host entry registers a same-origin local HTTP endpoint through DSH's `webServer` service. It scans the active profile's declared dependencies and package-local `skin.json` metadata. The browser entry contributes a first-class `settings.section` slot.

Switching writes the same final override block to both profile and home patch layers because the home layer can otherwise override the profile. Existing user YAML remains untouched outside the marked block. Selecting Original DSH marks every discovered skin disabled.

DSH 0.1.0-rc.7 exposes plugin inventory as read-only. Therefore the implementation deliberately uses Loader configuration HMR rather than a nonexistent mutable inventory API.
