import dotenv from "dotenv";
import { openai, streamText, calculateOpenAICompletionCostInMillicents, DefaultRun } from "modelfusion";
import { createInterface } from 'readline';
import chalk from 'chalk';

dotenv.config();

const readline = createInterface({
  input: process.stdin, output: process.stdout
})



async function main() {

  const run = new DefaultRun();

  readline.question('Whats your question?\n', async (input: string) => {

    if (!input) {
      main()
    }

    const textStream = await streamText(
      openai.CompletionTextGenerator({
        model: "gpt-3.5-turbo-instruct",
        maxGenerationTokens: 500,
      }),
      input,
      { run }
    );

    for await (const textFragment of textStream) {
      if (textFragment.includes('Whats your question')) {
        process.stdout.write(chalk.green(textFragment));
      } else {
        process.stdout.write(textFragment);
      }
    }

    main()

  })

}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

process.on('exit', (code) => console.log(chalk.red(`Exit with code ${code}. Goodbye`)))

