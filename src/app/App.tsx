import { useState, useEffect } from 'react';
import { MonthlyGoal } from '@/app/components/MonthlyDashboard';
import { WeeklyGoal } from '@/app/components/WeeklyPlanning';
import Goals from '@/app/components/Goals';
import DailyTasks, { DailyTask } from '@/app/components/DailyTasks';
import Dashboard from '@/app/components/Dashboard';
import ProfilePage from '@/app/components/ProfilePage';
import { SignupPage, LoginPage, CompanyInfoPage, EmployeeInfoPage, SignupData, CompanyData, Employee } from '@/app/components/auth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Target, CheckSquare, Download, LogOut, Home } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  company?: CompanyData;
  employees?: Employee[];
}

type AuthState = 'login' | 'signup' | 'companyInfo' | 'employeeInfo' | 'authenticated';
type AppView = 'dashboard' | 'workspace' | 'profile';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingSignupData, setPendingSignupData] = useState<SignupData | null>(null);
  const [pendingCompanyData, setPendingCompanyData] = useState<CompanyData | null>(null);
  const [appView, setAppView] = useState<AppView>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [activeTab, setActiveTab] = useState<'goals' | 'tasks'>('goals');
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedEmployees = localStorage.getItem('employees');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setAuthState('authenticated');
    }
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
  }, []);

  // Handle signup
  const handleSignup = (data: SignupData) => {
    setPendingSignupData(data);
    setAuthState('companyInfo');
  };

  // Handle company info submission
  const handleCompanyInfo = (companyData: CompanyData) => {
    setPendingCompanyData(companyData);
    setAuthState('employeeInfo');
  };

  // Handle employee info submission
  const handleEmployeeInfo = (newEmployees: Employee[]) => {
    if (pendingSignupData) {
      const newUser: User = {
        firstName: pendingSignupData.firstName,
        lastName: pendingSignupData.lastName,
        email: pendingSignupData.email,
        company: pendingCompanyData || undefined,
        employees: newEmployees
      };
      
      // Save user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      // Save employees separately for easy access
      localStorage.setItem('employees', JSON.stringify(newEmployees));
      setCurrentUser(newUser);
      setEmployees(newEmployees);
      setAuthState('authenticated');
      setPendingSignupData(null);
      setPendingCompanyData(null);
      toast.success(`Welcome, ${newUser.firstName}!`);
    }
  };

  // Handle login
  const handleLogin = (email: string, _password: string, rememberMe: boolean) => {
    // For demo purposes, we'll accept any login and create a user
    // In a real app, this would validate against a backend
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.email === email) {
        setCurrentUser(user);
        setAuthState('authenticated');
        toast.success(`Welcome back, ${user.firstName}!`);
        return;
      }
    }
    
    // Demo: allow any login
    const demoUser: User = {
      firstName: 'User',
      lastName: '',
      email: email
    };
    if (rememberMe) {
      localStorage.setItem('currentUser', JSON.stringify(demoUser));
    }
    setCurrentUser(demoUser);
    setAuthState('authenticated');
    toast.success('Logged in successfully!');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setAuthState('login');
    toast.info('Logged out successfully');
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    toast.info('Password reset functionality coming soon!');
  };

  // Template data
  const templateMonthlyGoal: MonthlyGoal = {
    id: 'template-monthly-1',
    title: 'Launch Updated Website',
    why: 'Improve user experience and increase conversions by 20%',
    resources: 'Design team, Development resources, Content writer',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    outcome: 'Fully responsive website with improved load times and modern design',
    nextSteps: ['Finalize wireframes', 'Complete design mockups', 'Development sprint', 'QA testing']
  };

  const templateMonthlyGoal2: MonthlyGoal = {
    id: 'template-monthly-2',
    title: 'Increase Team Productivity',
    why: 'Reduce meeting time by 30% and improve project delivery speed',
    resources: 'Project management tools, Team leads, HR support',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    outcome: 'Streamlined workflows with documented processes and automated reporting',
    nextSteps: ['Audit current workflows', 'Implement task automation', 'Train team on new tools', 'Measure improvements']
  };

  const templateWeeklyGoal: WeeklyGoal = {
    id: 'template-weekly-1',
    monthlyGoalId: 'template-monthly-1',
    goalTitle: 'Complete Homepage Redesign',
    targets: [
      { id: 'target-1', title: 'Finalize hero section design', actionSteps: ['Review competitors', 'Create 3 variations', 'Get stakeholder feedback'] },
      { id: 'target-2', title: 'Implement responsive navigation', actionSteps: ['Mobile-first approach', 'Test on all devices'] },
      { id: 'target-3', title: 'Optimize images and assets', actionSteps: ['Compress images', 'Set up lazy loading'] }
    ]
  };

  const templateWeeklyGoal2: WeeklyGoal = {
    id: 'template-weekly-2',
    monthlyGoalId: 'template-monthly-2',
    goalTitle: 'Set Up Project Management System',
    targets: [
      { id: 'target-4', title: 'Choose and configure PM tool', actionSteps: ['Compare Asana vs Monday vs Notion', 'Set up workspace', 'Create project templates'] },
      { id: 'target-5', title: 'Migrate existing projects', actionSteps: ['Export current data', 'Import to new system', 'Verify all tasks'] },
      { id: 'target-6', title: 'Team onboarding', actionSteps: ['Create training materials', 'Schedule team sessions', 'Gather feedback'] }
    ]
  };

  const templateDailyTask: DailyTask = {
    id: 'template-daily-1',
    weeklyGoalId: 'template-weekly-1',
    targetId: 'target-1',
    title: 'Review competitor websites for inspiration',
    dueDate: new Date().toISOString().split('T')[0],
    tags: ['Research', 'Design'],
    priority: 'High',
    status: 'To Do',
    timeSpent: 0,
    isActive: false
  };

  const templateDailyTask2: DailyTask = {
    id: 'template-daily-2',
    weeklyGoalId: 'template-weekly-2',
    targetId: 'target-4',
    title: 'Compare PM tools and create recommendation doc',
    dueDate: new Date().toISOString().split('T')[0],
    tags: ['Research', 'Documentation'],
    priority: 'Mid',
    status: 'To Do',
    timeSpent: 0,
    isActive: false
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedMonthlyGoals = localStorage.getItem('monthlyGoals');
    const savedWeeklyGoals = localStorage.getItem('weeklyGoals');
    const savedDailyTasks = localStorage.getItem('dailyTasks');

    // Load saved data or use templates if no data exists
    if (savedMonthlyGoals) {
      const parsed = JSON.parse(savedMonthlyGoals);
      setMonthlyGoals(parsed.length > 0 ? parsed : [templateMonthlyGoal, templateMonthlyGoal2]);
    } else {
      setMonthlyGoals([templateMonthlyGoal, templateMonthlyGoal2]);
    }

    if (savedWeeklyGoals) {
      const parsed = JSON.parse(savedWeeklyGoals);
      setWeeklyGoals(parsed.length > 0 ? parsed : [templateWeeklyGoal, templateWeeklyGoal2]);
    } else {
      setWeeklyGoals([templateWeeklyGoal, templateWeeklyGoal2]);
    }

    if (savedDailyTasks) {
      const parsed = JSON.parse(savedDailyTasks);
      setDailyTasks(parsed.length > 0 ? parsed : [templateDailyTask, templateDailyTask2]);
    } else {
      setDailyTasks([templateDailyTask, templateDailyTask2]);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('monthlyGoals', JSON.stringify(monthlyGoals));
  }, [monthlyGoals]);

  useEffect(() => {
    localStorage.setItem('weeklyGoals', JSON.stringify(weeklyGoals));
  }, [weeklyGoals]);

  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  const handleAddMonthlyGoal = (goal: Omit<MonthlyGoal, 'id'>) => {
    const newGoal: MonthlyGoal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9)
    };
    setMonthlyGoals([...monthlyGoals, newGoal]);
    toast.success('Monthly goal created successfully!');
  };

  const handleAddWeeklyGoal = (goal: Omit<WeeklyGoal, 'id'>) => {
    const newGoal: WeeklyGoal = {
      ...goal,
      id: Math.random().toString(36).substr(2, 9)
    };
    setWeeklyGoals([...weeklyGoals, newGoal]);
    toast.success('Weekly goal created successfully!');
  };

  const handleUpdateWeeklyGoal = (updatedGoal: WeeklyGoal) => {
    setWeeklyGoals(weeklyGoals.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    ));
    toast.success('Weekly goal updated successfully!');
  };

  const handleResetWeeklyGoal = (goalId: string) => {
    setWeeklyGoals(weeklyGoals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          goalTitle: '',
          targets: goal.targets.map(target => ({
            ...target,
            title: '',
            actionSteps: []
          }))
        };
      }
      return goal;
    }));
    toast.info('Weekly goal has been reset');
  };

  const handleDeleteMonthlyGoal = (goalId: string) => {
    setMonthlyGoals(monthlyGoals.filter(goal => goal.id !== goalId));
    toast.success('Monthly goal deleted');
  };

  const handleUpdateMonthlyGoal = (goalId: string, updates: Partial<MonthlyGoal>) => {
    setMonthlyGoals(monthlyGoals.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  };

  const handleDeleteWeeklyGoal = (goalId: string) => {
    setWeeklyGoals(weeklyGoals.filter(goal => goal.id !== goalId));
    toast.success('Weekly goal deleted');
  };

  const handleDeleteTask = (taskId: string) => {
    setDailyTasks(dailyTasks.filter(task => task.id !== taskId));
    toast.success('Task deleted');
  };

  const handleUpdateTask = (taskId: string, updates: Partial<DailyTask>) => {
    setDailyTasks(dailyTasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
    toast.success('Task updated successfully!');
  };

  const handleAddTask = (task: Omit<DailyTask, 'id' | 'timeSpent' | 'isActive'>) => {
    const newTask: DailyTask = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      timeSpent: 0,
      isActive: false
    };
    setDailyTasks([...dailyTasks, newTask]);
    toast.success('Task created successfully!');
  };

  const handleToggleTask = (taskId: string) => {
    setDailyTasks(dailyTasks.map(task => {
      if (task.id === taskId) {
        if (task.status === 'Done') {
          return { ...task, status: 'To Do' };
        } else {
          return { ...task, status: 'Done', isActive: false };
        }
      }
      return task;
    }));
  };

  const handleUpdateTaskStatus = (taskId: string, status: DailyTask['status']) => {
    setDailyTasks(dailyTasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const handleStartStopTask = (taskId: string) => {
    setDailyTasks(dailyTasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.isActive ? task.status : 'In Progress';
        const message = task.isActive 
          ? `Paused tracking for "${task.title}"` 
          : `Started tracking "${task.title}"`;
        toast.info(message);
        return { ...task, isActive: !task.isActive, status: newStatus };
      }
      // Stop other tasks if starting a new one
      if (task.isActive && !dailyTasks.find(t => t.id === taskId)?.isActive) {
        return { ...task, isActive: false };
      }
      return task;
    }));
  };

  const generateDailyReport = () => {
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const completedTasks = dailyTasks.filter(t => t.status === 'Done');
    const totalTimeSpent = dailyTasks.reduce((acc, task) => acc + task.timeSpent, 0);
    
    const report = `
=================================
DAILY WORK REPORT
${today}
=================================

SUMMARY:
- Total Tasks: ${dailyTasks.length}
- Completed: ${completedTasks.length}
- In Progress: ${dailyTasks.filter(t => t.status === 'In Progress').length}
- To Do: ${dailyTasks.filter(t => t.status === 'To Do').length}
- Total Time Tracked: ${Math.floor(totalTimeSpent / 60)}h ${totalTimeSpent % 60}m

COMPLETED TASKS:
${completedTasks.map(task => `
  ✓ ${task.title}
    Time Spent: ${Math.floor(task.timeSpent / 60)}h ${task.timeSpent % 60}m
    Priority: ${task.priority}
    Tags: ${task.tags.join(', ')}
`).join('\n') || '  No tasks completed today'}

IN PROGRESS TASKS:
${dailyTasks.filter(t => t.status === 'In Progress').map(task => `
  • ${task.title}
    Time Spent: ${Math.floor(task.timeSpent / 60)}h ${task.timeSpent % 60}m
    Priority: ${task.priority}
`).join('\n') || '  No tasks in progress'}

NEXT ACTIONS:
${dailyTasks.filter(t => t.status === 'To Do').map(task => `
  ○ ${task.title}
    Due: ${new Date(task.dueDate).toLocaleDateString()}
    Priority: ${task.priority}
`).join('\n') || '  No pending tasks'}

=================================
`;

    // Create a blob and download
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Daily report downloaded!');
  };

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate weekly goal progress from daily tasks
  const weeklyGoalsProgress = weeklyGoals.map(weeklyGoal => {
    const linkedTasks = dailyTasks.filter(task => task.weeklyGoalId === weeklyGoal.id);
    let progress = 0;
    if (linkedTasks.length > 0) {
      const completedTasks = linkedTasks.filter(task => task.status === 'Done').length;
      progress = Math.round((completedTasks / linkedTasks.length) * 100);
    }
    return {
      id: weeklyGoal.id,
      monthlyGoalId: weeklyGoal.monthlyGoalId,
      goalTitle: weeklyGoal.goalTitle,
      progress
    };
  });

  // Show auth pages if not authenticated
  if (authState === 'login') {
    return (
      <>
        <Toaster />
        <LoginPage
          onLogin={handleLogin}
          onSwitchToSignup={() => setAuthState('signup')}
          onForgotPassword={handleForgotPassword}
        />
      </>
    );
  }

  if (authState === 'signup') {
    return (
      <>
        <Toaster />
        <SignupPage
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthState('login')}
        />
      </>
    );
  }

  if (authState === 'companyInfo') {
    return (
      <>
        <Toaster />
        <CompanyInfoPage onContinue={handleCompanyInfo} />
      </>
    );
  }

  if (authState === 'employeeInfo') {
    return (
      <>
        <Toaster />
        <EmployeeInfoPage onContinue={handleEmployeeInfo} />
      </>
    );
  }

  // Show Dashboard view
  if (appView === 'dashboard') {
    return (
      <>
        <Toaster />
        <Dashboard
          employees={employees.length > 0 ? employees : generateDemoEmployees()}
          monthlyGoals={monthlyGoals}
          weeklyGoals={weeklyGoals}
          weeklyGoalsProgress={weeklyGoalsProgress}
          onNavigateToGoals={() => { setAppView('workspace'); setActiveTab('goals'); }}
          onNavigateToTasks={() => { setAppView('workspace'); setActiveTab('tasks'); }}
          onLogout={handleLogout}
          onProfileClick={() => setAppView('profile')}
        />
      </>
    );
  }

  // Show Profile view
  if (appView === 'profile') {
    return (
      <>
        <Toaster />
        <ProfilePage
          userData={{
            firstName: currentUser?.firstName || 'User',
            lastName: currentUser?.lastName || '',
            email: currentUser?.email || '',
            company: currentUser?.company
          }}
          onBack={() => setAppView('dashboard')}
          onSave={(data) => {
            if (currentUser) {
              const updatedUser = {
                ...currentUser,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email
              };
              setCurrentUser(updatedUser);
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster />
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setAppView('dashboard')}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
              <div className="px-4 py-2 border-2 border-primary rounded-lg">
                <h2 className="text-sm tracking-widest text-primary font-normal">WORK LIFE DESKS</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {currentUser && (
                <span className="text-sm text-gray-600">
                  Welcome, {currentUser.firstName}
                </span>
              )}
              <Button 
                onClick={generateDailyReport}
                variant="outline"
                className="flex items-center gap-2 border-2"
              >
                <Download className="w-4 h-4" />
                Generate Daily Report
              </Button>
              <Button 
                onClick={handleLogout}
                variant="ghost"
                className="flex items-center gap-2 text-gray-600 hover:text-red-500"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full max-w-xs grid-cols-2 mb-6 bg-gray-100 p-1">
            <TabsTrigger value="goals" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Target className="w-4 h-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <CheckSquare className="w-4 h-4" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="mt-0">
            <Goals
              monthlyGoals={monthlyGoals}
              weeklyGoals={weeklyGoals}
              onAddMonthlyGoal={handleAddMonthlyGoal}
              onUpdateMonthlyGoal={handleUpdateMonthlyGoal}
              onDeleteMonthlyGoal={handleDeleteMonthlyGoal}
              onAddWeeklyGoal={handleAddWeeklyGoal}
              onUpdateWeeklyGoal={handleUpdateWeeklyGoal}
              onDeleteWeeklyGoal={handleDeleteWeeklyGoal}
            />
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <DailyTasks
              tasks={dailyTasks}
              weeklyGoals={weeklyGoals}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onStartStopTask={handleStartStopTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Demo employees for when no employees are saved
function generateDemoEmployees(): Employee[] {
  return [
    { id: '1', name: 'Gopal Batra', title: 'Senior Developer', phoneNumber: '555-0101', email: 'gopal@example.com' },
    { id: '2', name: 'Bhavika Bhalla', title: 'UI/UX Designer', phoneNumber: '555-0102', email: 'bhavika@example.com' },
    { id: '3', name: 'Bhawna Kela', title: 'Project Manager', phoneNumber: '555-0103', email: 'bhawna@example.com' },
    { id: '4', name: 'Rahul Singh', title: 'Data Analyst', phoneNumber: '555-0104', email: 'rahul@example.com' },
    { id: '5', name: 'ACBD Employee', title: 'Associate', phoneNumber: '555-0105', email: 'acbd@example.com' },
    { id: '6', name: 'Priya Sharma', title: 'Frontend Developer', phoneNumber: '555-0106', email: 'priya@example.com' },
    { id: '7', name: 'Amit Kumar', title: 'Graphic Designer', phoneNumber: '555-0107', email: 'amit@example.com' },
    { id: '8', name: 'Neha Gupta', title: 'Team Lead', phoneNumber: '555-0108', email: 'neha@example.com' },
    { id: '9', name: 'Vikram Patel', title: 'Backend Developer', phoneNumber: '555-0109', email: 'vikram@example.com' },
    { id: '10', name: 'Ananya Reddy', title: 'Product Manager', phoneNumber: '555-0110', email: 'ananya@example.com' },
    { id: '11', name: 'Sanjay Verma', title: 'QA Engineer', phoneNumber: '555-0111', email: 'sanjay@example.com' },
    { id: '12', name: 'Meera Joshi', title: 'HR Manager', phoneNumber: '555-0112', email: 'meera@example.com' },
    { id: '13', name: 'Arjun Nair', title: 'DevOps Engineer', phoneNumber: '555-0113', email: 'arjun@example.com' },
    { id: '14', name: 'Kavita Rao', title: 'Marketing Lead', phoneNumber: '555-0114', email: 'kavita@example.com' },
    { id: '15', name: 'Deepak Mishra', title: 'Sales Executive', phoneNumber: '555-0115', email: 'deepak@example.com' },
    { id: '16', name: 'Shreya Kapoor', title: 'Content Writer', phoneNumber: '555-0116', email: 'shreya@example.com' },
  ];
}