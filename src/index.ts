import type { Context } from '@deepseek-ai/cordis'
import type { WebServer } from '@deepseek-ai/dsh-host-webserver'
import { promises as fs } from 'node:fs'
import path from 'node:path'

export const inject = ['webServer']
const ROUTE = '/api/dsh-ui-switcher'
const BEGIN = '# >>> dsh-ui-switcher (managed; do not edit inside)'
const END = '# <<< dsh-ui-switcher'

interface SkinMeta {
  id: string
  entryId: string
  packageName: string
  name: string
  nameEn?: string
  source: string
  enabled: boolean
  alias?: string
}

interface State { skins: SkinMeta[]; active: string; aliases: Record<string, string>; restartRequired: boolean }

function json(res: import('node:http').ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(text)
}

async function readJson(file: string): Promise<any | undefined> {
  try { return JSON.parse(await fs.readFile(file, 'utf8')) } catch { return undefined }
}

async function profileDir(): Promise<string> {
  const candidates = [process.env.DSH_PROFILE_DIR, process.cwd()].filter((value): value is string => Boolean(value))
  const profilesRoot = path.join(process.env.USERPROFILE ?? process.env.HOME ?? '', '.dsh', 'profiles')
  try {
    for (const entry of await fs.readdir(profilesRoot, { withFileTypes: true })) {
      if (entry.isDirectory()) candidates.push(path.join(profilesRoot, entry.name))
    }
  } catch {}
  for (const candidate of [...new Set(candidates)]) {
    const pkg = await readJson(path.join(candidate, 'package.json'))
    if (pkg?.dependencies?.['@dsh-external/dsh-ui-switcher'] || pkg?.dsh?.profile) return candidate
  }
  throw new Error('profile-not-found')
}

function homeDir(profile: string): string {
  return path.dirname(path.dirname(profile))
}

async function discover(profile: string): Promise<SkinMeta[]> {
  const profilePackage = await readJson(path.join(profile, 'package.json'))
  const dependencies = Object.keys(profilePackage?.dependencies ?? {})
  const result: SkinMeta[] = []
  for (const packageName of dependencies) {
    const packageRoot = path.join(profile, 'node_modules', ...packageName.split('/'))
    const pkg = await readJson(path.join(packageRoot, 'package.json'))
    const skin = await readJson(path.join(packageRoot, 'skin.json'))
    const looksLikeSkin = Boolean(skin?.wiring?.id && skin?.package) || /(?:ui[-_]?skin|webui|theme)/i.test(packageName)
    if (!looksLikeSkin || packageName === '@dsh-external/dsh-ui-switcher') continue
    const entryId = skin?.wiring?.id ?? `ui-skin-${skin?.id ?? packageName.replace(/^@[^/]+\//, '').replace(/[^a-z0-9]+/gi, '-')}`
    result.push({
      id: String(skin?.id ?? packageName), entryId, packageName,
      name: String(skin?.name ?? pkg?.displayName ?? pkg?.dsh?.displayName ?? pkg?.description ?? packageName),
      nameEn: skin?.nameEn, source: packageRoot, enabled: false,
    })
  }
  return result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
}

async function readAliases(profile: string): Promise<Record<string, string>> {
  const value = await readJson(path.join(profile, 'ui-switcher.aliases.json'))
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

async function patchStatus(file: string): Promise<Map<string, boolean>> {
  const map = new Map<string, boolean>()
  let text = ''
  try { text = await fs.readFile(file, 'utf8') } catch { return map }
  const row = /^- id:\s*([^\r\n]+)\r?\n\s+disabled:\s*(true|false)/gm
  for (const match of text.matchAll(row)) map.set(match[1].trim().replace(/^['"]|['"]$/g, ''), match[2] === 'true')
  return map
}

async function state(profile: string): Promise<State> {
  const skins = await discover(profile)
  const aliases = await readAliases(profile)
  const status = await patchStatus(path.join(profile, 'cordis.patch.yml'))
  for (const skin of skins) {
    skin.enabled = status.get(skin.entryId) === false
    skin.alias = aliases[skin.id]
  }
  return { skins, aliases, active: skins.find((skin) => skin.enabled)?.id ?? 'original', restartRequired: false }
}

function managedBlock(skins: SkinMeta[], selected: string): string {
  const rows = skins.map((skin) => `- id: ${skin.entryId}\n  disabled: ${selected === skin.id ? 'false' : 'true'}`).join('\n')
  return `${BEGIN}\n# Active UI: ${selected}\n${rows}\n${END}`
}

async function writeManaged(file: string, block: string): Promise<void> {
  let current = ''
  try { current = await fs.readFile(file, 'utf8') } catch {}
  const start = current.indexOf(BEGIN)
  const finish = current.indexOf(END)
  if (start >= 0 && finish >= start) current = current.slice(0, start) + current.slice(finish + END.length)
  const next = `${current.trimEnd()}\n\n${block}\n`.replace(/^\s*\n/, '')
  const temp = `${file}.${process.pid}.tmp`
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(temp, next, 'utf8')
  await fs.rename(temp, file)
}

async function body(req: import('node:http').IncomingMessage): Promise<any> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  if (Buffer.concat(chunks).length > 32_768) throw new Error('request-too-large')
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

export function apply(ctx: Context & { webServer: WebServer }): void {
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact', path: ROUTE,
    handler: async (req, res) => {
      try {
        const profile = await profileDir()
        if (req.method === 'GET') return json(res, 200, await state(profile))
        if (req.method !== 'POST') return json(res, 405, { error: 'method-not-allowed' })
        const input = await body(req)
        if (input.action === 'switch') {
          const current = await state(profile)
          if (input.id !== 'original' && !current.skins.some((skin) => skin.id === input.id)) return json(res, 400, { error: 'unknown-skin' })
          const block = managedBlock(current.skins, String(input.id))
          await writeManaged(path.join(profile, 'cordis.patch.yml'), block)
          await writeManaged(path.join(homeDir(profile), 'cordis.patch.yml'), block)
          return json(res, 200, { ok: true, selected: input.id, refreshRecommended: true })
        }
        if (input.action === 'alias') {
          const current = await state(profile)
          if (!current.skins.some((skin) => skin.id === input.id)) return json(res, 400, { error: 'unknown-skin' })
          const alias = String(input.alias ?? '').trim().slice(0, 80)
          if (alias) current.aliases[input.id] = alias; else delete current.aliases[input.id]
          await fs.writeFile(path.join(profile, 'ui-switcher.aliases.json'), JSON.stringify(current.aliases, null, 2) + '\n', 'utf8')
          return json(res, 200, { ok: true })
        }
        return json(res, 400, { error: 'unknown-action' })
      } catch (error) {
        return json(res, 500, { error: error instanceof Error ? error.message : String(error) })
      }
    },
  }), 'dsh-ui-switcher: local management endpoint')
}
