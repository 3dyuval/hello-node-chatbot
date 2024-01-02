import { test, it, expect, describe } from 'vitest'
import browser from './browser.js'
import { is } from 'unist-util-is'
import { visit } from 'unist-util-visit'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'


test('browser returns expected results on valid input', async () => {
    const stream = await browser('https://www.google.com')
    let chunks: number[] = []
    let buffer: Buffer
    let result: string


    expect(stream).toBeInstanceOf(ReadableStream)
    for await (const chunk of stream) {
        if (chunk !== null) {
            chunks.push(JSON.parse(chunk.toString()));
        }
    }
    expect(chunks.length).toBeGreaterThan(1)

    // create a string from the buffer
    buffer = Buffer.from(chunks);
    result = buffer.toString('utf8');

    expect(is(result, 'html')).toBeTruthy()
})

test('browser throws error on invalid input', async () => {
    try {
        await browser('invalid input')
    } catch (e) {
        it('should throw an error', () => {
            expect(e).toBeInstanceOf(Error)
            // expect(e.status).toBe(404)
        })
    }
})


