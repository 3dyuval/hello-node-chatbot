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


config();

const readline = createInterface({
    input: process.stdin, output: process.stdout
})


export default async function browser(input?: string): Promise<Stream.Readable> {

    const stream = new Stream.Readable()

    if (!input) {
        throw new Error('No input provided')
    }
    let url: string;

    try {
        url = new URL(input).toString();
    } catch {
        process.stdout.write(chalk.magentaBright('Invalid URL\n'))
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


    visit(pageMonad.document, 'element', (node) => {
        stream.push(JSON.stringify(node))
    })

    return stream
}
