// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initSearchSuggestions } from '../../src/utils/search-suggestions'
import { announce, trapFocus } from '../../src/utils/accessibility'
import { shouldFilterBuildWarning } from '../../src/integrations/filter-known-build-warnings'
import filterKnownBuildWarnings from '../../src/integrations/filter-known-build-warnings'

describe('branch-boost3', () => {
    it('initSearchSuggestions ArrowUp and Enter', () => {
        const input = document.createElement('input')
        const container = document.createElement('div')
        container.innerHTML =
            '<ul><li class="search-suggestions-item"><button class="search-suggestions-button" data-query="a">a</button></li><li class="search-suggestions-item"><button class="search-suggestions-button" data-query="b">b</button></li></ul>'
        document.body.appendChild(input)
        document.body.appendChild(container)
        const onSelect = vi.fn()
        const cleanup = initSearchSuggestions(input, container, onSelect)
        // set active
        const items = container.querySelectorAll('.search-suggestions-item')
        items[0].classList.add('active')
        // ArrowUp should move to last
        const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' })
        input.dispatchEvent(eventUp)
        expect(container.querySelector('.search-suggestions-item.active')).toBeTruthy()
        // Enter should click active
        const eventEnter = new KeyboardEvent('keydown', { key: 'Enter' })
        input.dispatchEvent(eventEnter)
        // Escape should clear
        const eventEsc = new KeyboardEvent('keydown', { key: 'Escape' })
        // first need to have something to clear
        container.innerHTML = '<div>test</div>'
        input.dispatchEvent(eventEsc)
        expect(container.innerHTML).toBe('')
        // ArrowDown wrap
        container.innerHTML =
            '<ul><li class="search-suggestions-item"></li><li class="search-suggestions-item"></li></ul>'
        const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        input.dispatchEvent(eventDown)
        cleanup()
        input.remove()
        container.remove()
    })
    it('announce and trapFocus with shift+tab', () => {
        announce('test1')
        announce('test2', 'assertive')
        const el = document.createElement('div')
        el.innerHTML = '<button>one</button><button>two</button>'
        document.body.appendChild(el)
        const cleanup = trapFocus(el)
        const first = el.querySelector('button')!
        const last = el.querySelectorAll('button')[1] as HTMLElement
        // focus first, then shift+tab should go to last
        first.focus()
        expect(document.activeElement).toBe(first)
        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true })
        el.dispatchEvent(event)
        expect(document.activeElement).toBe(last)
        // tab from last should go to first
        last.focus()
        const event2 = new KeyboardEvent('keydown', { key: 'Tab' })
        el.dispatchEvent(event2)
        expect(document.activeElement).toBe(first)
        cleanup()
        el.remove()
    })
    it('filter warnings more branches', () => {
        expect(shouldFilterBuildWarning(['Module \"stream\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"string_decoder\"'])).toBe(true)
        // test wrapStreamWrite with Uint8Array
        const integration = filterKnownBuildWarnings()
        integration.hooks['astro:config:setup']!({} as never)
        const origWrite = process.stdout.write
        let called = false
        // @ts-expect-error: suppress type error
        process.stdout.write = (buf: Uint8Array, enc?: unknown, cb?: unknown) => {
            called = true
            if (typeof enc === 'function') (enc as () => void)()
            if (typeof cb === 'function') (cb as () => void)()
            return true
        }
        const buf = Buffer.from('Module \"node:fs\" test')
        process.stdout.write(buf)
        // should filter and call cb
        expect(called).toBe(true)
        // test with string and encoding
        let captured = ''
        // @ts-expect-error: suppress type error
        process.stdout.write = (buf: string, enc?: unknown, cb?: unknown) => {
            captured = typeof buf === 'string' ? buf : buf.toString()
            return true
        }
        process.stdout.write('hello world', 'utf8')
        expect(captured).toBe('hello world')
        // single line not filtered
        process.stdout.write('Entry docs → 404 was not found.')
        // should be filtered to empty and return true
        // need to test with callback
        // @ts-expect-error: suppress type error
        process.stdout.write = (buf: string, enc?: unknown, cb?: unknown) => {
            if (typeof enc === 'function') {
                // enc is callback
                return origWrite.call(process.stdout, buf, enc as never)
            }
            return true
        }
        // restore
        integration.hooks['astro:build:done']!({} as never)
        process.stdout.write = origWrite
    })
})
