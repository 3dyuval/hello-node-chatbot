import { config } from "dotenv";
import { createInterface } from 'readline';
import chalk from 'chalk';
import { getPage, insertPage } from "./db.js";
import { PageMonad } from './Page.js'
import { CategorizedNodeMonad, Relevance } from './Node.js'
import flatMap from 'unist-util-flatmap'
import { visit } from 'unist-util-visit'
import { remove } from 'unist-util-remove'
import { filter } from 'unist-util-filter'
import Stream from 'node:stream'
import { Readable } from 'stream'


config();

const readline = createInterface({
    input: process.stdin, output: process.stdout
})


export default async function browser(input?: string): Promise<Stream.Readable> {


    if (!input) {
        throw new Error('No input provided')
    }
    let url: string;

    try {
        url = new URL(input).toString();
    } catch {
        throw new Error('Invalid URL')
    }

    type Page = { createdAt: string, url: string, document: string }

    let page = getPage.get(url) as Page | undefined;
    if (page === undefined) {
        const pageText = await fetch(url.toString())
            .then(res => res.text());

        insertPage.run(input, pageText as string) // cache
        page = getPage.get(input) as Page;
    }

    if (!page) {
        throw new Error('Error 404 (Page not found)');
    }

    const pageMonad = new PageMonad({
        createdAt: new Date().getTime(),
        url: page.url,
        document: page.document
    });


    const stream = new Stream.Readable({
        read() {
        }
    })

    visit(pageMonad.document, 'element', (node) => {
        stream.push(JSON.stringify(new CategorizedNodeMonad(node)))
    })

    return stream
}



export function streamToGenerator(readable: Readable): () => AsyncGenerator<unknown, void, unknown> {
    let done: boolean | Error = false;

    // Handle 'end' and 'error' events
    readable.on('end', () => {
        done = true;
    });
    readable.on('error', (err: Error) => {
        done = err;
    });

    return async function* generator() {
        while (!done) {
            const chunk = await new Promise((resolve, reject) => {
                readable.once('data', resolve);
                if (done) {
                    if (done instanceof Error) reject(done);
                    else resolve(done);
                }
            });

            if (chunk !== undefined) {
                yield chunk;
            }
        }
        readable.destroy()
    };
}