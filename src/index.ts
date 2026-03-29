import appManager from './app-manager/app-manager.ts';

appManager.start().catch((error) => {
  if (error instanceof Error && error.name === 'ExitPromptError') {
    // Handle user force closed the prompt
    console.log('\nPrompt closed.');
  } else {
    console.error('An unexpected error occurred:', error);
    process.exit(1);
  }
});
