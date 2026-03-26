# job-seek

`job-seek` is an application designed to aggregate and list job openings from various job boards and portals, tailored to user-defined preferences.

## Current State

At the moment, `job-seek` is a command-line interface (CLI) application powered by [`@inquirer/prompts`](https://www.npmjs.com/package/@inquirer/prompts). It allows users to interact with a set of prompts to define their job search criteria.

## Future Plans

The project is planned to evolve into a comprehensive **full-stack application** featuring a modern web-based UI. This will provide a more intuitive and feature-rich experience for managing job searches and applications.

## Key Features (In Progress/Planned)

- **Job Aggregation**: Fetch job listings from multiple sources.
- **User Preferences**: Filter jobs based on role, location, salary, and more.
- **CLI Interface**: Simple and interactive menu-driven prompts (current).
- **Web UI**: A full-featured dashboard for job seekers (future).

## Getting Started

To run the project locally, ensure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd job-seek
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

3.  **Run the development server**:
    ```bash
    pnpm dev
    ```

## Scripts

- `pnpm dev`: Runs the application using `tsx` for rapid development.
- `pnpm build`: Compiles the TypeScript code to JavaScript.
- `pnpm start`: Runs the compiled application.
- `pnpm lint`: Lints the codebase using ESLint.
- `pnpm format`: Formats the code using Prettier.
