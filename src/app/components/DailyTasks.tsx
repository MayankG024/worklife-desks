import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Plus, Calendar, ChevronDown, Clock, Play, Pause, MoreVertical, Grid, List, Trash2, Pencil, Target } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

export interface DailyTask {
  id: string;
  weeklyGoalId: string;
  targetId: string;
  title: string;
  dueDate: string;
  tags: string[];
  priority: 'High' | 'Mid' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done';
  timeSpent: number; // in minutes
  isActive: boolean; // currently being worked on
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
  onStartStopTask,
  onDeleteTask,
  onUpdateTask
}: DailyTasksProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [expandedTask, setExpandedTask] = useState<DailyTask | null>(null);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [newTask, setNewTask] = useState({
    weeklyGoalId: '',
    targetId: '',
    title: '',
    dueDate: '',
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
        tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      });
      setNewTask({
        weeklyGoalId: '',
        targetId: '',
        title: '',
        dueDate: '',
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

  const groupedTasks = {
    'To Do': tasks.filter(t => t.status === 'To Do'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done')
  };

  const activeTask = tasks.find(t => t.isActive);

  const handleUpdateTask = () => {
    if (editingTask && onUpdateTask) {
      onUpdateTask(editingTask.id, {
        title: editingTask.title,
        dueDate: editingTask.dueDate,
        tags: editingTask.tags,
        priority: editingTask.priority,
        weeklyGoalId: editingTask.weeklyGoalId,
        targetId: editingTask.targetId,
      });
      setEditingTask(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="tracking-wide mb-3 text-black font-semibold" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '2.4rem' }}>DAILY TASKS</h1>
          {activeTask && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-accent border-2 border-primary rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm">Working on: <span className="font-semibold">{activeTask.title}</span></span>
              <span className="text-sm text-gray-600">({formatTime(activeTaskTimes[activeTask.id] || activeTask.timeSpent)})</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'board' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('board')}
              className="rounded-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
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
                <Button onClick={handleSubmit} className="w-full">
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
      ) : viewMode === 'list' ? (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([status, statusTasks]) => (
            <Card key={status}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChevronDown className="w-4 h-4" />
                    <CardTitle>{status}</CardTitle>
                    <Badge variant="secondary">{statusTasks.length}</Badge>
                  </div>
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                {statusTasks.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No tasks in this category</p>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-4 text-sm text-gray-500 pb-2 border-b">
                      <div className="col-span-5">Task</div>
                      <div className="col-span-2">Due Date</div>
                      <div className="col-span-2">Task Tags</div>
                      <div className="col-span-2">Priority</div>
                      <div className="col-span-1">Time</div>
                    </div>
                    {statusTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="grid grid-cols-12 gap-4 items-center py-3 border-b hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedTask(task)}
                      >
                        <div className="col-span-5 flex items-center gap-3">
                          <Checkbox
                            checked={task.status === 'Done'}
                            onCheckedChange={() => onToggleTask(task.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className={cn(
                            task.status === 'Done' && 'line-through text-gray-400'
                          )}>
                            {task.title}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="col-span-2">
                          {task.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="mr-1 text-xs bg-blue-100 text-blue-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="col-span-2">
                          <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="col-span-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant={task.isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => onStartStopTask(task.id)}
                            className="w-8 h-8 p-0"
                          >
                            {task.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </Button>
                          {(activeTaskTimes[task.id] || task.timeSpent) > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(activeTaskTimes[task.id] || task.timeSpent)}</span>
                            </div>
                          )}
                          {onDeleteTask && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-red-500">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{task.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => onDeleteTask(task.id)} className="bg-red-500 hover:bg-red-600">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(groupedTasks).map(([status, statusTasks]) => (
            <Card key={status} className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{status}</CardTitle>
                  <Badge variant="secondary">{statusTasks.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {statusTasks.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No tasks</p>
                ) : (
                  statusTasks.map((task) => (
                    <Card 
                      key={task.id} 
                      className="border-2 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => setExpandedTask(task)}
                    >
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <Checkbox
                            checked={task.status === 'Done'}
                            onCheckedChange={() => onToggleTask(task.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className={cn(
                          "font-medium",
                          task.status === 'Done' && 'line-through text-gray-400'
                        )}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Button
                              variant={task.isActive ? "default" : "outline"}
                              size="sm"
                              onClick={() => onStartStopTask(task.id)}
                            >
                              {task.isActive ? (
                                <>
                                  <Pause className="w-3 h-3 mr-1" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 mr-1" />
                                  Start
                                </>
                              )}
                            </Button>
                            {onDeleteTask && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{task.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDeleteTask(task.id)} className="bg-red-500 hover:bg-red-600">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                          {(activeTaskTimes[task.id] || task.timeSpent) > 0 && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(activeTaskTimes[task.id] || task.timeSpent)}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
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
                  onClick={handleUpdateTask}
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