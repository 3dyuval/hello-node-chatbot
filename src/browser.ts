import { config } from "dotenv";
import { openai, streamText } from "modelfusion";
import { createInterface } from 'readline';
import chalk from 'chalk';
import { allPages, getPage, insertPage } from "./db.js";

config();

const readline = createInterface({
  input: process.stdin, output: process.stdout
})


async function main() {

  readline.question("I'm a browser. Give me a URL\n", async (input: string) => {

    if (!input) {
      main()
    }

    try {

      const url = new URL(input);

      type Page = { createdAt: string, url: string, document: string }

      let fromCache = true;
      let page = getPage.get(input) as Page | undefined ;

      if (page === undefined) {
        fromCache = false;
        const pageText = await fetch(url).then(res => res.text()) ;
        insertPage.run(input, pageText as string) // cache
        page = getPage.get(input) as Page;
      }

      if (!page) {
        throw new Error('Error 404 (Page not found)')
      }

      if (fromCache) {
        console.log(chalk.green(`Found page from cache. Your first visit ${page.createdAt}`))
      }


      console.log(chalk.yellow(page.document.slice(0, 100)))

    } catch (error) {
      console.error(error)
    }

    main()

  })

}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

process.on('exit', (code) => console.log(chalk.red(`Exit with code ${code}. Goodbye`)))

