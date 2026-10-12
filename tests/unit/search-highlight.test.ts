// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { highlightSearchResults, initSearchResultHighlight } from '../../src/utils/search-highlight'

describe('search-highlight', () => {
    describe('highlightSearchResults', () => {
        it('returns original content when query is empty', () => {
            expect(highlightSearchResults('hello world', '')).toBe('hello world')
        })

        it('returns original content when query is whitespace only', () => {
            expect(highlightSearchResults('hello world', '   ')).toBe('hello world')
        })

        it('wraps matching text in highlight span', () => {
            expect(highlightSearchResults('hello world', 'world')).toBe(
                'hello <span class="search-highlight">world</span>'
            )
        })

        it('highlights multiple occurrences', () => {
            expect(highlightSearchResults('abc abc abc', 'abc')).toBe(
                '<span class="search-highlight">abc</span> <span class="search-highlight">abc</span> <span class="search-highlight">abc</span>'
            )
        })

        it('performs case-insensitive matching', () => {
            expect(highlightSearchResults('Hello HELLO hello', 'hello')).toBe(
                '<span class="search-highlight">Hello</span> <span class="search-highlight">HELLO</span> <span class="search-highlight">hello</span>'
            )
        })

        it('uses custom class name when provided', () => {
            expect(highlightSearchResults('test content', 'test', 'custom-class')).toBe(
                '<span class="custom-class">test</span> content'
            )
        })

        it('escapes regex special characters in query', () => {
            expect(highlightSearchResults('price is $10.00', '$10.00')).toBe(
                'price is <span class="search-highlight">$10.00</span>'
            )
        })

        it('handles Chinese text matching', () => {
            expect(highlightSearchResults('激光雷达传感器', '激光')).toBe(
                '<span class="search-highlight">激光</span>雷达传感器'
            )
        })

        it('returns original content when no match is found', () => {
            expect(highlightSearchResults('hello world', 'xyz')).toBe('hello world')
        })

        it('handles partial word matching', () => {
            expect(highlightSearchResults('sensing and sensors', 'sens')).toBe(
                '<span class="search-highlight">sens</span>ing and <span class="search-highlight">sens</span>ors'
            )
        })
    })

    describe('initSearchResultHighlight', () => {
        it('highlights matches inside a container', () => {
            const container = document.createElement('div')
            container.innerHTML = '<p>hello world</p><p>hello again</p><code>hello</code>'
            document.body.appendChild(container)
            initSearchResultHighlight(container, 'hello')
            expect(container.innerHTML).toContain('search-highlight')
            container.remove()
        })

        it('leaves container untouched for empty query or code-only content', () => {
            const c2 = document.createElement('div')
            c2.innerHTML = '<p>test</p>'
            initSearchResultHighlight(c2, '')
            expect(c2.innerHTML).toBe('<p>test</p>')
            const c3 = document.createElement('div')
            c3.innerHTML = '<script>hello</script>'
            initSearchResultHighlight(c3, 'hello')
            expect(c3.innerHTML).toContain('<script>')
            c2.remove()
            c3.remove()
        })

        it('highlights bare text nodes without a parent element', () => {
            const container = document.createElement('div')
            container.innerHTML = 'hello world'
            initSearchResultHighlight(container, 'hello')
            expect(container.innerHTML).toContain('search-highlight')
            container.remove()
        })
    })
})
