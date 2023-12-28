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

      let fromCache = true;
      let page = getPage.get(input);

      if (!page) {
        fromCache = false;
        page = await fetch(url).then(res => res.text());
        insertPage.run(input, page) // cache
        page = getPage.get(input);
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

