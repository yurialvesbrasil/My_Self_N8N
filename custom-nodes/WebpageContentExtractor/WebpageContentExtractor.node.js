"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpageContentExtractor = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const readability_1 = require("@mozilla/readability");
const jsdom_1 = require("jsdom");
class WebpageContentExtractor {
    constructor() {
        this.description = {
            displayName: 'Webpage Content Extractor',
            name: 'webpageContentExtractor',
            icon: 'file:WebpageContentExtractor.svg',
            group: ['transform'],
            version: 1,
            description: 'Extracts the content from a given URL. Similar to the "Reader" mode in your browser, it ignores headers, footers, banners, etc.',
            defaults: {
                name: 'WebpageContentExtractor',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'HTML Code',
                    name: 'html',
                    type: 'string',
                    required: true,
                    default: '',
                    placeholder: '',
                    description: 'Use the "HTTP Request" node to fetch the HTML code of a website and pass it here',
                }
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const output = [];
        for (let i = 0; i < items.length; i++) {
            const html = this.getNodeParameter('html', i);
            const doc = new jsdom_1.JSDOM(html);
            const article = new readability_1.Readability(doc.window.document).parse();
            if (!article) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), "Could not extract main contents of webpage.");
            }
            output.push({
                json: {
                    excerpt: article.excerpt,
                    siteName: article.siteName,
                    length: article.length,
                    textContent: article.textContent,
                    content: article.content,
                    title: article.title,
                    language: article.lang,
                    byline: article.byline,
                    publishedTime: article.publishedTime,
                }
            });
        }
        return [this.helpers.returnJsonArray(output)];
    }
}
exports.WebpageContentExtractor = WebpageContentExtractor;
//# sourceMappingURL=WebpageContentExtractor.node.js.map