# Book List Management App
<img width="2764" height="1574" alt="image" src="https://github.com/user-attachments/assets/74253f99-f0ce-4e39-9481-12c52991cc5f" />

**You can run this app either locally (with npm) or in Docker (with Nginx). Both options are fully supported and documented below.**

A modern Angular 21 application for managing personal book lists with a beautiful, responsive UI built with signals and standalone components.

## Quick Start

### Installation & Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run linter
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

The app will be available at `http://localhost:4200`

### Docker

Build and run with Docker and Nginx:

```bash
# Build the Docker image
docker build -t book-management-app .

# Run the container
docker run -p 4200:4200 book-management-app
```

The app will be available at `http://localhost:4200`

⚡ **Technical Highlights**
- **Angular 21** with Signals and standalone components
- **Reactive state management** with computed signals
- **Signal-based forms** (no FormBuilder)
- **HttpClient** for API integration
- **SCSS** for modular styling
- **Jest** for fast unit testing
- **ESLint** configured for code quality

## Available Scripts

- `npm start` - Start Angular dev server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run Jest tests in watch mode
- `npm run test:coverage` - Run Jest tests with coverage report
- `npm run watch` - Build in watch mode

## Project Structure

```
src/
├── app/
│   ├── components/                   # Reusable UI components
│   │   ├── book-card/               # Book display card
│   │   ├── create-list-dialog/      # Create list dialog
│   │   ├── edit-list-dialog/        # Edit list dialog
│   │   └── confirm-dialog/          # Delete confirmation
│   ├── pages/
│   │   └── dashboard/               # Main dashboard page
│   ├── services/                    # Business logic
│   │   └── book.service.ts          # Book/list management service
│   ├── models/                      # TypeScript interfaces
│   │   └── book.model.ts            # Data models
│   ├── app.ts                       # Root component
│   ├── app.config.ts                # Application providers
│   └── app.routes.ts                # Application routing
├── environments/                    # Environment configs
│   ├── environment.ts               # Development
│   └── environment.prod.ts          # Production
├── styles.scss                      # Global styles
└── index.html                       # Entry point
```

## Key Angular Features Used

- ✅ **Signals** - Reactive state management (no OnPush needed)
- ✅ **Computed Signals** - Derived state
- ✅ **Standalone Components** - Modern architecture
- ✅ **Signal-based Forms** - Type-safe form handling
- ✅ **New Control Flow** - `@if`, `@for`, `@switch`
- ✅ **Dependency Injection** - Service patterns
- ✅ **HttpClient** - API communication
