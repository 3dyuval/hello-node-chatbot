import { CategorizedNodeMonad } from '../../Node.js'
import rehypeFormat from 'rehype-format'
import html from 'rehype-stringify'
import { PageMonad } from '../../Page'
import { fromHtml } from 'hast-util-from-html'
import { rehype } from 'rehype'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'


export default async function (req, reply) {

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  // const file = fs.readFileSync(path.resolve( __dirname, '../../../', 'fixtures', 'google.html'), { encoding: 'utf8' })

  const { url } = req.query

  const document = await fetch(url.toString())
      .then(res => res.text());

  const pageMonad = new PageMonad({
    createdAt: new Date().getTime(),
    url: url,
    document: document
  })

  const categorizedHast = pageMonad.map(node => new CategorizedNodeMonad(node))

  // Array.from($$('[priority="high"]')).map(node=> {
  //   return node.innerHTML.length ? node.innerHTML : node?.value ? node.value : node
  // })

  const output = pageMonad.htmlProcessor.stringify(categorizedHast)
  reply.header('Content-Type', 'text/html')
  return reply.send(String(output))
}