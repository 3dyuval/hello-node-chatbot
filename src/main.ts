import dotenv from "dotenv";
import { openai, streamText, calculateCost, DefaultRun, OpenAICostCalculator } from "modelfusion";
import { createInterface } from 'readline';
import chalk from 'chalk';

dotenv.config();

const readline = createInterface({
  input: process.stdin, output: process.stdout
})


let totalCost = 0;


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

    totalCost = await estimateCost(run);
    
    main()

  })
  
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

process.on('exit', (code) => showTotalCost())

function showTotalCost() {
  console.log(`\n Total Cost: ${chalk.underline.blue('$'+ totalCost.toPrecision(4).toString())} \n`);
}

async function estimateCost(run: any) {
  const cost =  await calculateCost({
    calls: run.successfulModelCalls,
    costCalculators: [new OpenAICostCalculator()],
  });

  return Number.parseFloat(cost.formatAsDollarAmount({ decimals: 4 }))
  
}