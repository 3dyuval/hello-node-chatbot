import { visit } from 'unist-util-visit'
import { is } from 'unist-util-is'


export enum Degree {
    High = 'high',
    Medium = 'medium',
    Low = 'low',
    Unknown = 'unknown'
}

export const PRIORITY = {
    [Degree.High]: [
        'button', 'a', 'input', 'textarea', 'select', 'link', // Interactive elements
        'strong', 'em', 'mark', // Emphasized elements
        'title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', // High hierarchy elements
        'meta', 'address' // Additional high priority elements
    ] as const,
    [Degree.Medium]: [
        'p',                                        // Structural elements
        'img', 'video', 'audio',
        'i', 'b', 'u', 's', 'small', 'sub', 'sup', // Formatting elements
        'span', 'li', 'dt', 'dd', 'caption', 'figure', 'figcaption', 'main', // Informational elements
        'address', 'details', 'summary', 'figcaption', 'blockquote' // Additional medium priority elements
    ],
    [Degree.Low]: [
        'picture', 'source', 'track', // Additional information elements
        'div', 'section', 'article', 'header', 'footer', 'nav', 'aside', // Structural elements
        'br', 'pre', 'code' // Additional low priority elements
    ] as const,
    [Degree.Unknown]: ['html', 'head', 'script', 'noscript', 'style', 'ul', 'ol', 'resource', 'iframe'] as const
};


export type Node = {
    type: 'element' | 'text' | 'comment';
    tagName:  Exclude<(typeof PRIORITY[Degree]), string | number | symbol | Array<any>>;
    position: {
        start: object; end: object
    };
    children: Array<Node>
}


export class CategorizedNodeMonad implements Node {
    // public readonly node: Node;
    public type = ''
    public tagName =  ''
    public position: {
        start: {}, end: {}
    }
    public children = []
    public readonly priority: Degree;

    constructor(node: Node) {
        Object.assign(this, node)
        this.priority = this.categorize(node);
    }

    // Monad return
    static return(node: Node): CategorizedNodeMonad {
        return new CategorizedNodeMonad(node);
    }

    private categorize(node: Node): Degree {

        const tagName = (node as any).tagName;

        if (PRIORITY[Degree.High].includes(tagName)) {
            return Degree.High;
        } else if (PRIORITY[Degree.Medium].includes(tagName)) {
            return Degree.Medium;
        } else if (PRIORITY[Degree.Low].includes(tagName)) {
            return Degree.Low;
        }
        return Degree.Unknown;
    }

}

