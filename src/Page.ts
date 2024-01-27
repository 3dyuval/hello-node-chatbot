import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import { Node } from 'unist'
import { map as mapHast, MapFunction } from 'unist-util-map'
import { filter as filterHast } from 'unist-util-filter'
import rehypeRewrite from 'rehype-rewrite'
import rehypeStringify from 'rehype-stringify'
import html from 'rehype-stringify'
import rehypeFormat from 'rehype-format'


type Page = { createdAt: number, url: string, document: any }
type PageInput = { createdAt: number, url: string, document: string | Node }

export class PageMonad {
  private value: Page

  constructor(value: PageInput) {
    this.value = {
      createdAt: value.createdAt,
      url: value.url,
      document: (typeof value.document === 'string')
          ? unified().use(rehypeFormat)
              .use(rehypeStringify)
              .use(rehypeParse)
              .parse(value.document)
          : value.document
    }

    //Fix relative urls
    this.value.document = this.map((node) => {
      const { properties } = node;
      ['href', 'url', 'src'].forEach(target => {
        if (properties?.hasOwnProperty(target) && !properties[target].startsWith('http')) {
          const absoluteUrl = new URL(properties[target], value.url).toString();
          properties[target] = absoluteUrl
          Object.assign(node.properties, { hello: 'world' })
        }
      })
      return node
    })

  }

  publicfilter(fn: any
  ) {
    return filterHast.apply(this.value.document, fn)
  }

  public htmlProcessor = unified().use(rehypeParse).use(html)
  public toHtmlString() {
    return this.htmlProcessor.stringify(this.value.document)
  }

  // Monad bind
  public bind(func: (value: Page) => PageMonad): PageMonad {
    try {
      return func(this.value);
    } catch (error) {
      console.error(error);
      return this;
    }
  }


  public map(func: MapFunction<any>) {
    return mapHast(this.value.document, func)
  }

  get document() {
    return this.value.document
  }

  get url() {
    return this.value.url
  }

  get createdAt() {
    return this.value.createdAt
  }


}

