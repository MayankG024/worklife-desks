import { useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Menu, User, Pin, Phone, ChevronRight } from 'lucide-react';
import { Employee } from '@/app/components/auth';
import { MonthlyGoal } from '@/app/components/MonthlyDashboard';
import { WeeklyGoal } from '@/app/components/WeeklyPlanning';
import { Progress } from '@/app/components/ui/progress';

interface EmployeeWithStatus extends Employee {
  currentTask: string;
  isActive: boolean;
  isPinned?: boolean;
}

interface DashboardProps {
  employees: Employee[];
  monthlyGoals: MonthlyGoal[];
  weeklyGoals: WeeklyGoal[];
  weeklyGoalsProgress: Array<{ id: string; monthlyGoalId: string; progress: number }>;
  onNavigateToMonthly: () => void;
  onNavigateToWeekly: () => void;
  onNavigateToDaily: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
}

const getRandomTask = (): string => {
  const tasks = ['Tyoharz listing.', 'NBL.', 'Worklifedesks.', 'Bandana sourcing.', 'Project review.', 'Client call.'];
  return tasks[Math.floor(Math.random() * tasks.length)];
};

export default function Dashboard({ 
  employees, 
  monthlyGoals, 
  weeklyGoals, 
  weeklyGoalsProgress,
  onNavigateToMonthly, 
  onNavigateToWeekly,
  onNavigateToDaily,
  onLogout,
  onProfileClick
}: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Add status to employees
  const employeesWithStatus: EmployeeWithStatus[] = employees.map((emp, idx) => ({
    ...emp,
    currentTask: getRandomTask(),
    isActive: Math.random() > 0.3,
    isPinned: idx === 0
  }));

  // Calculate monthly goal progress
  const getMonthlyGoalProgress = (goalId: string): number => {
    const linkedWeeklyGoals = weeklyGoalsProgress.filter(wg => wg.monthlyGoalId === goalId);
    if (linkedWeeklyGoals.length === 0) return 0;
    const totalProgress = linkedWeeklyGoals.reduce((sum, wg) => sum + wg.progress, 0);
    return Math.round(totalProgress / linkedWeeklyGoals.length);
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-full mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="px-4 py-2 border-2 border-primary rounded-lg">
              <h2 className="text-sm tracking-widest text-primary font-normal">WORK LIFE DESKS</h2>
            </div>
            <button 
              onClick={onProfileClick}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="View Profile"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="bg-white w-64 shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Navigation</h3>
            <button onClick={() => { onNavigateToMonthly(); setSidebarOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg">Monthly Goals</button>
            <button onClick={() => { onNavigateToWeekly(); setSidebarOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg">Weekly Planning</button>
            <button onClick={() => { onNavigateToDaily(); setSidebarOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg">Daily Tasks</button>
            <hr />
            <button onClick={onLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg">Logout</button>
          </div>
          <div className="flex-1 bg-black/20" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Sidebar - Goals Summary */}
        <div className="w-72 flex flex-col gap-4 flex-shrink-0">
          {/* Monthly Goals Mini */}
          <Card className="flex-1 border-2 overflow-hidden flex flex-col">
            <div className="bg-primary text-white px-4 py-2 flex justify-between items-center">
              <h3 className="font-semibold text-sm">Monthly Goals</h3>
              <button onClick={onNavigateToMonthly} className="text-white/80 hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {monthlyGoals.slice(0, 3).map((goal) => {
                const progress = getMonthlyGoalProgress(goal.id);
                return (
                  <div key={goal.id} className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium truncate mb-1">{goal.title}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-gray-500">{progress}%</span>
                    </div>
                  </div>
                );
              })}
              {monthlyGoals.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No monthly goals yet</p>
              )}
            </div>
          </Card>

          {/* Weekly Goals Mini */}
          <Card className="flex-1 border-2 overflow-hidden flex flex-col">
            <div className="bg-primary text-white px-4 py-2 flex justify-between items-center">
              <h3 className="font-semibold text-sm">Weekly Goals</h3>
              <button onClick={onNavigateToWeekly} className="text-white/80 hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {weeklyGoals.slice(0, 3).map((goal) => {
                const progressData = weeklyGoalsProgress.find(p => p.id === goal.id);
                const progress = progressData?.progress || 0;
                return (
                  <div key={goal.id} className="p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium truncate mb-1">{goal.goalTitle}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-gray-500">{progress}%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{goal.targets.length} targets</p>
                  </div>
                );
              })}
              {weeklyGoals.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No weekly goals yet</p>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="border-2 p-3">
            <h3 className="font-semibold text-sm mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs justify-start"
                onClick={onNavigateToDaily}
              >
                View Daily Tasks
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs justify-start"
                onClick={onNavigateToWeekly}
              >
                Plan Weekly Goals
              </Button>
            </div>
          </Card>
        </div>

        {/* Employees Section */}
        <div className="flex-1 flex flex-col min-w-0">
          <h1 className="text-2xl font-bold text-center mb-4 tracking-wide">EMPLOYEES</h1>
          
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-4 gap-3">
              {employeesWithStatus.map((employee) => (
                <Card key={employee.id} className="border rounded-xl overflow-hidden">
                  <CardContent className="p-3">
                    {/* Pin indicator */}
                    <div className="flex justify-end items-start mb-2">
                      {employee.isPinned && (
                        <Pin className="w-4 h-4 text-blue-500 fill-blue-500" />
                      )}
                    </div>
                    
                    {/* Avatar */}
                    <div className="flex justify-center mb-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Name and phone */}
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">{employee.name || 'Employee'}</h3>
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    
                    {/* Current task */}
                    <p className="text-xs text-gray-500 mb-3 truncate">
                      I'm currently working on<br/>{employee.currentTask}
                    </p>
                    
                    {/* Status badge with active/inactive indicator */}
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${employee.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                      <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
                        In Office
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
