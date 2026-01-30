# Work Life Desks

A modern workplace management application built with React and TypeScript for managing employees, tracking goals, and improving team productivity.

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Vite](https://img.shields.io/badge/Vite-6.3-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1-teal)

## Features

### 🔐 Authentication
- User signup and login
- Company information setup
- Employee management with CSV upload support

### 👥 Employee Dashboard
- View all employees in a grid layout
- Real-time status indicators (Active/Inactive)
- Quick access to employee profiles

### 🎯 Goal Management
- **Monthly Goals**: Set and track monthly objectives with workflow audit
- **Weekly Planning**: Break down monthly goals into weekly targets
- **Daily Tasks**: Manage daily tasks linked to weekly goals

### 📊 Progress Tracking
- Visual progress bars for goals
- Automatic progress calculation from completed tasks
- Key metrics tracking

### 👤 Profile Management
- Editable user profile
- Work mode settings (Work From Home/Office/Hybrid)
- Online/Offline status toggle
- Current task visibility

## Tech Stack

- **Frontend**: React 18.3 with TypeScript
- **Build Tool**: Vite 6.3
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Radix UI / shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/MayankG024/worklife-desks.git

# Navigate to project directory
cd worklife-desks

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

## Project Structure

```
src/
├── app/
│   ├── App.tsx              # Main application component
│   └── components/
│       ├── Dashboard.tsx     # Employee dashboard
│       ├── ProfilePage.tsx   # User profile page
│       ├── MonthlyDashboard.tsx
│       ├── WeeklyPlanning.tsx
│       ├── DailyTasks.tsx
│       ├── auth/             # Authentication components
│       └── ui/               # Reusable UI components
├── styles/
│   └── *.css                 # Global styles
└── main.tsx                  # Entry point
```

## License

MIT License

## Author

Mayank Gupta - [@MayankG024](https://github.com/MayankG024)
