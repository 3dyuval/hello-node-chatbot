import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import { Node } from 'unist'
import { visit, VisitorResult } from 'unist-util-visit'
import { is } from 'unist-util-is'
import { Visitor} from 'unist-util-visit'


type Page = { createdAt: number, url: string, document: any }
type PageInput = { createdAt: number, url: string, document: string | Node }

export class PageMonad {
    private value: Page

    constructor(value: PageInput) {
        this.value = {
            createdAt: value.createdAt,
            url: value.url,
            document: (typeof value.document === 'string') ? unified().use(rehypeParse).parse(value.document) : value.document
        }
    }

    // Monad bind
    public bind(func: (value: Page) => PageMonad):
        PageMonad {
        try {
            return func(this.value);
        } catch (error) {
            console.error(error);
            return this;
        }
    }

    // Functor map
    public map(func: (value: Page) => Page) {
        return new PageMonad(func(this.value))
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

