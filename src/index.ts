import { input, select, confirm } from '@inquirer/prompts';

let programRunning = true;

async function main() {
  while (programRunning) {
    console.log('Welcome to the Job Seek CLI!');

    const name = await input({
      message: 'What is your name?',
    });

    const role = await select({
      message: 'What role are you looking for?',
      choices: [
        { name: 'Frontend Engineer', value: 'frontend' },
        { name: 'Backend Engineer', value: 'backend' },
        { name: 'Fullstack Engineer', value: 'fullstack' },
        { name: 'DevOps Engineer', value: 'devops' },
      ],
    });

    const confirmSubmit = await confirm({
      message: 'Do you want to submit your application?',
    });

    if (confirmSubmit) {
      console.log(
        `\nThank you, ${name}! Your application for ${role} has been submitted.`
      );
    } else {
      console.log('\nApplication cancelled.');
    }
  }
}

main().catch((error) => {
  if (error instanceof Error && error.name === 'ExitPromptError') {
    // Handle user force closed the prompt
    console.log('\nPrompt closed.');
  } else {
    console.error('An unexpected error occurred:', error);
    process.exit(1);
  }
});
