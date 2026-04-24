import { describe, expect, it } from 'vitest'

import { highlightSearchResults } from '../../src/utils/search-highlight'

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
})
