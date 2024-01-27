import dotenv from "dotenv";
import { openai, streamText, calculateOpenAICompletionCostInMillicents, DefaultRun } from "modelfusion";
import { createInterface } from 'readline';
import chalk, { chalkStderr } from 'chalk';
import browser, { streamToGenerator } from './browser'
import { read } from 'node:fs'
import { CategorizedNodeMonad } from './Node'


dotenv.config();

const readline = createInterface({
    input: process.stdin, output: process.stdout
})


async function main() {


    readline.question(chalk.bgGreenBright('Whats your question?\n'), async (input: string) => {

        if (!input) {
            readline.write(chalk.magentaBright('No input provided\n'))
            main()
            return
        }

        if (input === 'browser') {
            readline.write('Opening browser...\n')
            readline.question('Enter URL: ', async (url: string) => {
                const stream = await browser(url)
                const site = streamToGenerator(stream)

                for await (const chunk of site()) {
                    const node = JSON.parse(chunk.toString()) as CategorizedNodeMonad
                    await new Promise((resolve, reject) => {
                        readline.question(chalk.bgGreenBright(`press 'Enter' to get next node, type anything else to stop\n`), resolve);
                        process.stdout.write(chalk(chalk.blue(`${node.tagName}: ${node.priority};\n`)))
                    })
                }

                readline.write(chalk.magentaBright('Done. Closing browser...\n'))
                main(); // Ask the question again

            })
        } else if (input) {
            const textStream = await streamText(
                openai.CompletionTextGenerator({
                    model: "gpt-3.5-turbo-instruct",
                    maxGenerationTokens: 500
                }),
                input
            );

            for await (const textFragment of textStream) {
                readline.write(textFragment);
            }
        }


        main()

    })

}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

process.on('exit', (code) => console.log(chalk.magenta(`Exit with code ${code}. Goodbye`)))

