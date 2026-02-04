# WorkFlow App UI

UI for WorkFlow expense approval application developed using React + TypeScript + Vite.

## Features

- **Authentication**: JWT-based authentication with login and registration
- **Role-Based Access Control**: Three user roles (Employee, Manager, Admin)
- **Expense Management**: Create, edit, submit, and track expenses
- **Approval Workflow**: Manager/Admin can approve or reject submitted expenses
- **Modern Stack**: React 18, TypeScript, Vite, TailwindCSS, React Router

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 3
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Notifications**: react-hot-toast
- **Date Formatting**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on port 5064

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_URL=http://localhost:5064
```

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── api/              # API client and endpoint definitions
├── components/       # Reusable React components
├── context/          # React Context providers
├── pages/            # Page components
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## License

MIT
