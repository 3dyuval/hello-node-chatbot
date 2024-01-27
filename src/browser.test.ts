import { test, it, expect, describe } from 'vitest'
import browser, { streamToGenerator } from './browser.js'
import { is } from 'unist-util-is'
import { visit } from 'unist-util-visit'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import { Readable } from 'stream'
import fs from 'fs'
import path from 'path'
import { CategorizedNodeMonad } from './Node'



describe('browser', () => {

    it('should return stream from url', async () => {
        const stream = await browser('https://www.google.com')
        expect(stream).toBeInstanceOf(Readable)
    })

    it('should return stream from file', async () => {
        const stream = fs.createReadStream(path.resolve(__dirname, '../', 'fixtures', 'google.html'))
        expect(stream).toBeInstanceOf(Readable)
    })


    it('should return async generator from stream', async () => {
        const stream = fs.createReadStream(path.resolve(__dirname, '../', 'fixtures', 'google.html'))
        const generator = streamToGenerator(stream)
        expect(generator).toBeTypeOf('function')
    })

    it('should have pririty on node', async () => {
        const stream = fs.createReadStream(path.resolve(__dirname, '../', 'fixtures', 'google.html'))
        const generator = streamToGenerator(stream)

        generator().next().then((iteration) => {

            const node = JSON.parse(iteration.value.toString())
            expect(node).toHaveProperty('priority')

        })

    })


})

test('browser throws error on invalid input', async () => {
    await browser('invalid input')
        .catch((e) => {
                expect(e).toBeInstanceOf(Error)
        })
})


