import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Menu, User, Mail, Pencil, Check, X, Clock, Calendar, Plus, Search, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Employee } from '@/app/components/auth';

type EmployeeMode = 'working' | 'away' | 'offline' | 'busy';

interface EmployeeWithStatus extends Employee {
  currentTask: string;
  taskDescription: string;
  greeting: string;
  mode: EmployeeMode;
  isPinned?: boolean;
  workHours: string;
  role?: string;
}

interface EditingState {
  [employeeId: string]: {
    field: 'greeting' | 'task' | 'workHours' | null;
  };
}

interface TaskItem {
  id: string;
  name: string;
  completed: boolean;
  timeSpent: string; // format: "HH:MM:SS"
  inProgress: boolean;
}

interface EmployeeTasks {
  [employeeId: string]: TaskItem[];
}

interface EmployeeData {
  [employeeId: string]: {
    greeting: string;
    taskDescription: string;
    workHours: string;
  };
}

interface DashboardProps {
  employees: Employee[];
  isLoading?: boolean;
  onNavigateToGoals: () => void;
  onNavigateToTasks: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
}

const getRandomTask = (): string => {
  const tasks = ['Tyoharz listing', 'NBL', 'Worklifedesks', 'Bandana sourcing', 'Project review', 'Client call'];
  return tasks[Math.floor(Math.random() * tasks.length)];
};

const getRandomMode = (): EmployeeMode => {
  const modes: EmployeeMode[] = ['working', 'away', 'offline', 'busy'];
  return modes[Math.floor(Math.random() * modes.length)];
};

const getModeColor = (mode: EmployeeMode): string => {
  switch (mode) {
    case 'working': return 'bg-green-500';
    case 'away': return 'bg-amber-400';
    case 'offline': return 'bg-gray-400';
    case 'busy': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};



export default function Dashboard({ 
  employees,
  isLoading = false,
  onNavigateToGoals, 
  onNavigateToTasks,
  onLogout,
  onProfileClick
}: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeModes, setEmployeeModes] = useState<Record<string, EmployeeMode>>(() => {
    const saved = localStorage.getItem('employeeModes');
    return saved ? JSON.parse(saved) : {};
  });
  const [editing, setEditing] = useState<EditingState>({});
  const [employeeData, setEmployeeData] = useState<EmployeeData>(() => {
    const saved = localStorage.getItem('employeeData');
    return saved ? JSON.parse(saved) : {};
  });
  const [employeeTasks, setEmployeeTasks] = useState<EmployeeTasks>({});
  const [newTaskInput, setNewTaskInput] = useState<Record<string, string>>({});
  const [employeeNotes, setEmployeeNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('employeeNotes');
    return saved ? JSON.parse(saved) : {};
  });

  // Persist employeeModes to localStorage
  useEffect(() => {
    localStorage.setItem('employeeModes', JSON.stringify(employeeModes));
  }, [employeeModes]);

  // Persist employeeData to localStorage
  useEffect(() => {
    localStorage.setItem('employeeData', JSON.stringify(employeeData));
  }, [employeeData]);

  // Persist employeeNotes to localStorage
  useEffect(() => {
    localStorage.setItem('employeeNotes', JSON.stringify(employeeNotes));
  }, [employeeNotes]);

  // Initialize default tasks for an employee
  const getEmployeeTasks = (empId: string): TaskItem[] => {
    if (!employeeTasks[empId]) {
      return [
        { id: '1', name: 'Bandana Vendor Follow-up', completed: false, timeSpent: '01:24:36', inProgress: false },
        { id: '2', name: 'Dye Sample Approval', completed: false, timeSpent: '00:37:12', inProgress: false },
        { id: '3', name: 'Cost Negotiation', completed: false, timeSpent: '00:19:45', inProgress: false },
        { id: '4', name: 'Inventory Check', completed: false, timeSpent: '00:12:08', inProgress: false },
        { id: '5', name: 'Front-End Bug Fixes', completed: false, timeSpent: '00:00:00', inProgress: true },
      ];
    }
    return employeeTasks[empId];
  };

  // Calculate total time from tasks
  const calculateTotalTime = (tasks: TaskItem[]): string => {
    let totalSeconds = 0;
    tasks.forEach(task => {
      if (!task.inProgress) {
        const parts = task.timeSpent.split(':');
        totalSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      }
    });
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Add new task
  const addTask = (employeeId: string) => {
    const taskName = newTaskInput[employeeId]?.trim();
    if (!taskName) return;
    
    const currentTasks = getEmployeeTasks(employeeId);
    const newTask: TaskItem = {
      id: Date.now().toString(),
      name: taskName,
      completed: false,
      timeSpent: '00:00:00',
      inProgress: false
    };
    
    setEmployeeTasks(prev => ({
      ...prev,
      [employeeId]: [...currentTasks, newTask]
    }));
    setNewTaskInput(prev => ({ ...prev, [employeeId]: '' }));
  };

  // Toggle task completion
  const toggleTaskCompletion = (employeeId: string, taskId: string) => {
    const currentTasks = getEmployeeTasks(employeeId);
    setEmployeeTasks(prev => ({
      ...prev,
      [employeeId]: currentTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  // Initialize employee data if not exists
  const getEmployeeData = (empId: string, task: string) => {
    if (!employeeData[empId]) {
      return {
        greeting: `I'm currently working on ${task}.`,
        taskDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
        workHours: '9:00 - 18:00'
      };
    }
    return employeeData[empId];
  };

  // Add status to employees
  const employeesWithStatus: EmployeeWithStatus[] = employees.map((emp, idx) => {
    const task = getRandomTask();
    const data = getEmployeeData(emp.id, task);
    return {
      ...emp,
      currentTask: task,
      taskDescription: data.taskDescription,
      greeting: data.greeting,
      mode: employeeModes[emp.id] || getRandomMode(),
      isPinned: idx === 0,
      workHours: data.workHours
    };
  });

  // Filter employees based on search query
  const filteredEmployees = employeesWithStatus.filter(employee => {
    const query = searchQuery.toLowerCase();
    return (
      employee.name.toLowerCase().includes(query) ||
      (employee.role?.toLowerCase() || '').includes(query) ||
      employee.mode.toLowerCase().includes(query)
    );
  });

  const handleModeChange = (employeeId: string, mode: EmployeeMode) => {
    setEmployeeModes(prev => ({ ...prev, [employeeId]: mode }));
  };

  const startEditing = (employeeId: string, field: 'greeting' | 'task' | 'workHours') => {
    setEditing(prev => ({ ...prev, [employeeId]: { field } }));
  };

  const stopEditing = (employeeId: string) => {
    setEditing(prev => ({ ...prev, [employeeId]: { field: null } }));
  };

  const updateEmployeeData = (employeeId: string, field: 'greeting' | 'taskDescription' | 'workHours', value: string) => {
    setEmployeeData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        greeting: prev[employeeId]?.greeting || '',
        taskDescription: prev[employeeId]?.taskDescription || '',
        workHours: prev[employeeId]?.workHours || '9:00 - 18:00',
        [field]: value
      }
    }));
  };

  const isEditing = (employeeId: string, field: 'greeting' | 'task' | 'workHours') => {
    return editing[employeeId]?.field === field;
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
          <div className="bg-white w-64 shadow-xl p-8 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Navigation</h3>
            <button onClick={() => { onNavigateToGoals(); setSidebarOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">Goals</button>
            <button onClick={() => { onNavigateToTasks(); setSidebarOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">Tasks</button>
            <hr />
            <button onClick={onLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">Logout</button>
          </div>
          <div className="flex-1 bg-black/20" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Employees Section */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-center mb-3 tracking-wide">EMPLOYEES</h1>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name, role, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-[#1a5f4a] focus:ring-[#1a5f4a]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-[#1a5f4a] mx-auto mb-4" />
                  <p className="text-gray-500">Loading employees...</p>
                </div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              /* Empty State */
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {searchQuery ? 'No employees found' : 'No employees yet'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? `No employees match "${searchQuery}". Try a different search term.`
                      : 'Add employees to get started with tracking their work and progress.'}
                  </p>
                  {searchQuery && (
                    <Button 
                      onClick={() => setSearchQuery('')}
                      variant="outline"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* Employee Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((employee) => (
                <Card key={employee.id} className="border-2 border-gray-300 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Left side - Avatar and Name */}
                      <div className="p-6 flex flex-col items-center justify-start border-r-2 border-gray-200 bg-gray-50/50 min-w-[140px]">
                        {/* Animated Avatar Placeholder */}
                        <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-green-200 mb-3 overflow-hidden bg-gradient-to-br from-green-100 via-green-200 to-emerald-200 animate-pulse">
                          <svg viewBox="0 0 24 24" className="w-12 h-12 text-green-600/60 fill-current">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                        
                        {/* Name */}
                        <h3 className="font-medium text-gray-800 text-lg">{employee.name || 'Employee'}</h3>
                        
                        {/* Role - under name */}
                        <p className="text-sm text-gray-500 mt-1">{employee.role || 'Team Member'}</p>
                        
                        {/* Contact Icons */}
                        <div className="mt-auto pt-6 flex justify-center gap-2">
                          <button className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </button>
                          <button className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                            <Mail className="w-5 h-5 text-white" />
                          </button>
                        </div>
                        
                        {/* Timestamp - Editable */}
                        <div className="pt-4 w-full">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800 text-sm">Timestamp</p>
                            {isEditing(employee.id, 'workHours') ? (
                              <button 
                                onClick={() => stopEditing(employee.id)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                <Check className="w-3 h-3 text-green-600" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => startEditing(employee.id, 'workHours')}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                <Pencil className="w-3 h-3 text-gray-400" />
                              </button>
                            )}
                          </div>
                          {isEditing(employee.id, 'workHours') ? (
                            <Input
                              value={employeeData[employee.id]?.workHours || employee.workHours}
                              onChange={(e) => updateEmployeeData(employee.id, 'workHours', e.target.value)}
                              className="h-7 text-sm mt-1"
                              placeholder="9:00 - 18:00"
                            />
                          ) : (
                            <p className="text-gray-500 text-sm">{employee.workHours}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Right side - Details */}
                      <div className="flex-1 flex flex-col">
                        {/* Greeting - Editable */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <span className="font-semibold text-gray-700 text-sm">Greeting: </span>
                              {isEditing(employee.id, 'greeting') ? (
                                <Input
                                  value={employeeData[employee.id]?.greeting || employee.greeting}
                                  onChange={(e) => updateEmployeeData(employee.id, 'greeting', e.target.value)}
                                  className="h-7 text-sm mt-1"
                                  placeholder="Enter greeting..."
                                />
                              ) : (
                                <span className="text-gray-600 text-sm">{employee.greeting}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {isEditing(employee.id, 'greeting') ? (
                                <button 
                                  onClick={() => stopEditing(employee.id)}
                                  className="p-1 hover:bg-gray-200 rounded flex-shrink-0 transition-colors"
                                >
                                  <Check className="w-3 h-3 text-green-600" />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => startEditing(employee.id, 'greeting')}
                                  className="p-1 hover:bg-gray-200 rounded flex-shrink-0 transition-colors"
                                >
                                  <Pencil className="w-3 h-3 text-gray-400" />
                                </button>
                              )}
                              {/* Mode Dropdown */}
                              <Select 
                                value={employee.mode} 
                                onValueChange={(value: EmployeeMode) => handleModeChange(employee.id, value)}
                              >
                                <SelectTrigger className="w-8 h-8 border-0 bg-transparent p-0 focus:ring-0 flex-shrink-0">
                                  <div className={`w-6 h-6 rounded-full shadow-md ${getModeColor(employee.mode)}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="working">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full bg-green-500" />
                                      <span>Working</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="away">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full bg-amber-400" />
                                      <span>Away</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="offline">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full bg-gray-400" />
                                      <span>Offline</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="busy">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full bg-red-500" />
                                      <span>Busy</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        {/* Task Section - Task List Format */}
                        <div className="px-4 py-3 flex-1 flex flex-col bg-gradient-to-br from-blue-50/30 to-indigo-50/20 rounded-lg shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-800 text-sm">Task List</p>
                            {isEditing(employee.id, 'task') ? (
                              <button 
                                onClick={() => stopEditing(employee.id)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <X className="w-3 h-3 text-gray-500" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => startEditing(employee.id, 'task')}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Pencil className="w-3 h-3 text-gray-400" />
                              </button>
                            )}
                          </div>
                          
                          {isEditing(employee.id, 'task') ? (
                            <div className="flex-1 flex flex-col bg-gray-50 rounded-lg p-3 -mx-1">
                              {/* Add Task Input */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                                  <Plus className="w-4 h-4 text-gray-400" />
                                  <Input
                                    value={newTaskInput[employee.id] || ''}
                                    onChange={(e) => setNewTaskInput(prev => ({ ...prev, [employee.id]: e.target.value }))}
                                    placeholder="Add task..."
                                    className="border-0 h-6 text-sm p-0 focus-visible:ring-0"
                                    onKeyDown={(e) => e.key === 'Enter' && addTask(employee.id)}
                                  />
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => addTask(employee.id)}
                                  className="h-8 text-xs"
                                >
                                  Add
                                </Button>
                              </div>
                              
                              {/* Task List */}
                              <div className="flex-1 overflow-auto space-y-1 max-h-32">
                                {getEmployeeTasks(employee.id).map((task) => (
                                  <div 
                                    key={task.id} 
                                    className={`flex items-center justify-between py-1.5 px-2 rounded ${task.inProgress ? 'bg-yellow-50' : 'bg-white'}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        checked={task.completed}
                                        onCheckedChange={() => toggleTaskCompletion(employee.id, task.id)}
                                        className="h-4 w-4"
                                      />
                                      <span className={`text-xs ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                        {task.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      {task.inProgress ? (
                                        <span className="text-primary font-medium">— In Progress</span>
                                      ) : (
                                        <>
                                          <Clock className="w-3 h-3" />
                                          <span>{task.timeSpent}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Total Time */}
                              <div className="flex justify-end mt-2 pt-2 border-t border-gray-200">
                                <span className="text-xs font-medium text-gray-600">
                                  Total Time: {calculateTotalTime(getEmployeeTasks(employee.id))}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600 leading-relaxed">
                              {(() => {
                                const tasks = getEmployeeTasks(employee.id);
                                const inProgressTask = tasks.find(t => t.inProgress);
                                const completedCount = tasks.filter(t => t.completed).length;
                                return (
                                  <div className="space-y-1">
                                    {inProgressTask && (
                                      <p className="text-primary font-medium text-xs">
                                        Working on: {inProgressTask.name}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                      {completedCount}/{tasks.length} tasks completed
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Total: {calculateTotalTime(tasks)}
                                    </p>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>

                        {/* Note Section */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-700 text-sm mb-1">Note</p>
                          <textarea
                            value={employeeNotes[employee.id] || ''}
                            onChange={(e) => setEmployeeNotes(prev => ({ ...prev, [employee.id]: e.target.value }))}
                            className="w-full h-16 text-sm border border-gray-200 rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            placeholder="Add a note..."
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
