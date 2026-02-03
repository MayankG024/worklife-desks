import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Textarea } from '@/app/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Plus, Calendar, Clock, MoreVertical, Pencil, Target, FileText } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

export interface DailyTask {
  id: string;
  weeklyGoalId: string;
  targetId: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  tags: string[];
  priority: 'High' | 'Mid' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done';
  timeSpent: number; // in minutes
  isActive: boolean; // currently being worked on
  starred?: boolean;
  assignedTo?: string;
  notes?: string;
  addedToMyTasks?: boolean;
}

interface DailyTasksProps {
  tasks: DailyTask[];
  weeklyGoals: Array<{ id: string; goalTitle: string; targets: Array<{ id: string; title: string }> }>;
  onAddTask: (task: Omit<DailyTask, 'id' | 'timeSpent' | 'isActive'>) => void;
  onToggleTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: DailyTask['status']) => void;
  onStartStopTask: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<DailyTask>) => void;
}

export default function DailyTasks({ 
  tasks, 
  weeklyGoals, 
  onAddTask, 
  onToggleTask, 
  onUpdateTaskStatus: _onUpdateTaskStatus, 
  onUpdateTask
}: DailyTasksProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedTask, setExpandedTask] = useState<DailyTask | null>(null);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [newTask, setNewTask] = useState({
    weeklyGoalId: '',
    targetId: '',
    title: '',
    dueDate: '',
    dueTime: '',
    assignedTo: '',
    notes: '',
    tags: '',
    priority: 'Mid' as const,
    status: 'To Do' as const
  });

  const [activeTaskTimes, setActiveTaskTimes] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTaskTimes(prev => {
        const newTimes = { ...prev };
        tasks.forEach(task => {
          if (task.isActive) {
            newTimes[task.id] = (newTimes[task.id] || task.timeSpent) + 1;
          } else {
            newTimes[task.id] = task.timeSpent;
          }
        });
        return newTimes;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [tasks]);

  const handleSubmit = () => {
    if (newTask.title && newTask.weeklyGoalId && newTask.targetId && newTask.dueDate) {
      onAddTask({
        ...newTask,
        tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        starred: false,
        addedToMyTasks: false
      });
      setNewTask({
        weeklyGoalId: '',
        targetId: '',
        title: '',
        dueDate: '',
        dueTime: '',
        assignedTo: '',
        notes: '',
        tags: '',
        priority: 'Mid',
        status: 'To Do'
      });
      setIsDialogOpen(false);
    }
  };

  const selectedGoal = weeklyGoals.find(g => g.id === newTask.weeklyGoalId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-300';
      case 'Mid': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const toggleStar = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateTask) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        onUpdateTask(taskId, { starred: !task.starred });
      }
    }
  };

  const toggleAddToMyTasks = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateTask) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        onUpdateTask(taskId, { addedToMyTasks: !task.addedToMyTasks });
      }
    }
  };

  const toggleNoteExpansion = (taskId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const activeTask = tasks.find(t => t.isActive);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="tracking-wide mb-3 text-black font-semibold" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '2.4rem' }}>DAILY TASKS</h1>
          {activeTask && (
            <div className="flex items-center gap-2 mt-3 p-4 bg-accent border-2 border-primary rounded-lg hover:shadow-sm transition-shadow">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm">Working on: <span className="font-semibold">{activeTask.title}</span></span>
              <span className="text-sm text-gray-600">({formatTime(activeTaskTimes[activeTask.id] || activeTask.timeSpent)})</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 hover:shadow-md transition-all">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="weeklyGoal">Select Weekly Goal *</Label>
                  <select
                    id="weeklyGoal"
                    value={newTask.weeklyGoalId}
                    onChange={(e) => setNewTask({ ...newTask, weeklyGoalId: e.target.value, targetId: '' })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Choose a weekly goal...</option>
                    {weeklyGoals.map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.goalTitle}</option>
                    ))}
                  </select>
                </div>
                {selectedGoal && (
                  <div className="space-y-2">
                    <Label htmlFor="target">Select Target *</Label>
                    <select
                      id="target"
                      value={newTask.targetId}
                      onChange={(e) => setNewTask({ ...newTask, targetId: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Choose a target...</option>
                      {selectedGoal.targets.map(target => (
                        <option key={target.id} value={target.id}>{target.title}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="taskTitle">Task Title *</Label>
                  <Input
                    id="taskTitle"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g., Website Development"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueTime">Due Time</Label>
                    <Input
                      id="dueTime"
                      type="time"
                      value={newTask.dueTime}
                      onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newTask.notes}
                    onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newTask.tags}
                    onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                    placeholder="e.g., Work, Design, Urgent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <select
                    id="priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Low">Low</option>
                    <option value="Mid">Mid</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <Button type="button" onClick={handleSubmit} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {tasks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No tasks yet. Create your first task to get started!</p>
          {weeklyGoals.length === 0 ? (
            <p className="text-sm text-gray-400">Create weekly goals first to organize your tasks.</p>
          ) : (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Task
            </Button>
          )}
        </Card>
      ) : (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
          {/* Task List */}
          <div className="divide-y divide-gray-100">
            {[...tasks].sort((a, b) => {
              // Starred tasks come first
              if (a.starred && !b.starred) return -1;
              if (!a.starred && b.starred) return 1;
              return 0;
            }).map((task) => (
              <div key={task.id} className="hover:bg-gray-50 transition-colors">
                {/* Main Task Row */}
                <div className="p-4 flex items-center gap-3">
                  {/* Checkbox */}
                  <Checkbox
                    checked={task.status === 'Done'}
                    onCheckedChange={() => onToggleTask(task.id)}
                    className="h-5 w-5 flex-shrink-0"
                  />
                  
                  {/* Star */}
                  <button
                    onClick={(e) => toggleStar(task.id, e)}
                    className="flex-shrink-0 transition-colors"
                  >
                    {task.starred ? (
                      <svg className="w-5 h-5 fill-yellow-400 stroke-yellow-400" viewBox="0 0 24 24" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 fill-none stroke-gray-400 hover:stroke-yellow-400" viewBox="0 0 24 24" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    )}
                  </button>

                  {/* Task Title */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-gray-800 truncate",
                      task.status === 'Done' && 'line-through text-gray-400'
                    )}>
                      {task.title}
                    </p>
                  </div>

                  {/* Due Date & Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {task.dueTime && <span className="ml-1">{task.dueTime}</span>}
                    </span>
                  </div>

                  {/* Priority Badge */}
                  <Badge className={cn("text-xs flex-shrink-0", getPriorityColor(task.priority))}>
                    {task.priority}
                  </Badge>

                  {/* Assigned To */}
                  {task.assignedTo && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-[#1a5f4a] text-white text-xs font-medium">
                          {task.assignedTo.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}

                  {/* Add to My Tasks Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => toggleAddToMyTasks(task.id, e)}
                    className={cn(
                      "flex-shrink-0 transition-all",
                      task.addedToMyTasks && 'bg-[#1a5f4a] text-white hover:bg-[#164a3a] border-[#1a5f4a]'
                    )}
                  >
                    {task.addedToMyTasks ? 'Added' : 'Add'}
                  </Button>

                  {/* Notes Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNoteExpansion(task.id)}
                    className="flex-shrink-0 transition-colors"
                  >
                    <FileText 
                      className={cn(
                        "w-5 h-5",
                        expandedNotes.has(task.id) ? 'text-[#1a5f4a]' : 'text-gray-400'
                      )} 
                    />
                  </Button>

                  {/* More Options */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedTask(task)}
                    className="flex-shrink-0"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>

                {/* Expandable Notes Section */}
                {expandedNotes.has(task.id) && (
                  <div className="px-4 pb-4 pt-0 ml-14 border-t border-gray-100 bg-gray-50">
                    <Textarea
                      value={task.notes || ''}
                      onChange={(e) => onUpdateTask && onUpdateTask(task.id, { notes: e.target.value })}
                      placeholder="Add notes..."
                      className="mt-3 bg-white"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Task View */}
      <Dialog open={!!expandedTask} onOpenChange={(open) => !open && setExpandedTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">{expandedTask?.title}</DialogTitle>
          </DialogHeader>
          {expandedTask && (
            <div className="space-y-4 mt-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs", getPriorityColor(expandedTask.priority))}>
                  {expandedTask.priority} Priority
                </Badge>
                <Badge variant={expandedTask.status === 'Done' ? 'default' : 'secondary'}>
                  {expandedTask.status}
                </Badge>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Due: {new Date(expandedTask.dueDate).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {/* Time Spent */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Time spent: {formatTime(activeTaskTimes[expandedTask.id] || expandedTask.timeSpent)}
                </span>
              </div>

              {/* Linked Weekly Goal */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-[#1a5f4a]" />
                  <h4 className="text-sm font-semibold text-gray-700">Linked Weekly Goal</h4>
                </div>
                <p className="text-sm text-gray-600">
                  {weeklyGoals.find(g => g.id === expandedTask.weeklyGoalId)?.goalTitle || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Target: {weeklyGoals.find(g => g.id === expandedTask.weeklyGoalId)?.targets.find(t => t.id === expandedTask.targetId)?.title || 'Unknown'}
                </p>
              </div>

              {/* Tags */}
              {expandedTask.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {expandedTask.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setExpandedTask(null)}>
                  Close
                </Button>
                <Button 
                  className="bg-[#1a5f4a] hover:bg-[#164a3a]" 
                  onClick={() => {
                    setEditingTask(expandedTask);
                    setExpandedTask(null);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Task
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Task Title</Label>
                <Input 
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input 
                  type="date"
                  value={editingTask.dueDate}
                  onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Low">Low</option>
                  <option value="Mid">Mid</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input 
                  value={editingTask.tags.join(', ')}
                  onChange={(e) => setEditingTask({
                    ...editingTask, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                  })}
                />
              </div>
              <div>
                <Label>Weekly Goal</Label>
                <select
                  value={editingTask.weeklyGoalId}
                  onChange={(e) => setEditingTask({ ...editingTask, weeklyGoalId: e.target.value, targetId: '' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose a weekly goal...</option>
                  {weeklyGoals.map(goal => (
                    <option key={goal.id} value={goal.id}>{goal.goalTitle}</option>
                  ))}
                </select>
              </div>
              {editingTask.weeklyGoalId && (
                <div>
                  <Label>Target</Label>
                  <select
                    value={editingTask.targetId}
                    onChange={(e) => setEditingTask({ ...editingTask, targetId: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Choose a target...</option>
                    {weeklyGoals.find(g => g.id === editingTask.weeklyGoalId)?.targets.map(target => (
                      <option key={target.id} value={target.id}>{target.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingTask(null)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-[#1a5f4a] hover:bg-[#164a3a]" 
                  onClick={() => {
                    if (editingTask && onUpdateTask) {
                      onUpdateTask(editingTask.id, editingTask);
                      setEditingTask(null);
                    }
                  }}
                  disabled={!onUpdateTask}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}