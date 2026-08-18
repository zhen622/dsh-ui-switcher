import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import React, { useCallback, useEffect, useState } from 'react'

export const inject = ['slots', 'locale']
const NS = 'uiSwitcher'
const API = '/api/dsh-ui-switcher'
type Skin = { id: string; name: string; nameEn?: string; enabled: boolean; alias?: string; packageName: string }
type State = { skins: Skin[]; active: string }

const zh = { nav: '界面切换', original: 'DSH 原版界面', originalHint: '禁用所有第三方 UI，作为安全回退', refresh: '切换已保存，请刷新页面', alias: '自定义名称', save: '保存', loading: '正在扫描已安装界面…', error: '操作失败' }
const en = { nav: 'Interface', original: 'Original DSH', originalHint: 'Disable all third-party UIs as a safe fallback', refresh: 'Saved. Refresh the page to finish switching.', alias: 'Custom name', save: 'Save', loading: 'Scanning installed interfaces…', error: 'Operation failed' }
type UiSwitcherKey = keyof typeof zh

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { uiSwitcher: UiSwitcherKey }
}

async function request(input?: unknown): Promise<any> {
  const response = await fetch(API, input ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) } : undefined)
  const value = await response.json()
  if (!response.ok) throw new Error(value.error ?? response.statusText)
  return value
}

function Switcher({ t }: PropsLocale<'uiSwitcher'>): React.ReactElement {
  const [state, setState] = useState<State>()
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const load = useCallback(() => request().then(setState).catch((e) => setNotice(`${t('error')}: ${e.message}`)), [t])
  useEffect(() => { void load() }, [load])
  const choose = async (id: string) => {
    setBusy(true); setNotice('')
    try { await request({ action: 'switch', id }); setState((old) => old ? { ...old, active: id } : old); setNotice(t('refresh')) }
    catch (e) { setNotice(`${t('error')}: ${e instanceof Error ? e.message : String(e)}`) }
    finally { setBusy(false) }
  }
  const alias = async (skin: Skin) => {
    const value = window.prompt(t('alias'), skin.alias ?? skin.name)
    if (value === null) return
    await request({ action: 'alias', id: skin.id, alias: value }); await load()
  }
  if (!state) return React.createElement('p', null, notice || t('loading'))
  const item = (id: string, title: string, hint: string, skin?: Skin) => React.createElement('div', { key: id, style: { padding: '14px 0', borderBottom: '1px solid var(--dsw-alias-line-border-subtle, #ddd)' } },
    React.createElement('label', { style: { display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start' } },
      React.createElement('input', { type: 'radio', name: 'dsh-ui', checked: state.active === id, disabled: busy, onChange: () => void choose(id) }),
      React.createElement('span', null, React.createElement('strong', null, title), React.createElement('small', { style: { display: 'block', opacity: .7, marginTop: 4 } }, hint))),
    skin && React.createElement('button', { type: 'button', onClick: () => void alias(skin), style: { margin: '8px 0 0 26px' } }, t('alias')))
  return React.createElement('section', null,
    item('original', t('original'), t('originalHint')),
    ...state.skins.map((skin) => item(skin.id, skin.alias || skin.name, `${skin.nameEn ?? ''}${skin.nameEn ? ' · ' : ''}${skin.packageName}`, skin)),
    notice && React.createElement('p', { role: 'status', style: { marginTop: 16 } }, notice))
}

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-ui-switcher: dictionaries')
  const t = ctx.locale.bind(NS)
  ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: 'ui-switcher', order: 12, label: () => t('nav'), locale: NS }, Switcher))
}
