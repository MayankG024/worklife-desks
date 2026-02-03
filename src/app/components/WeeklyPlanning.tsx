import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Label } from '@/app/components/ui/label';
import { Plus, Target, X, Save, MoreHorizontal, Calendar, LayoutGrid, ChevronLeft, ChevronRight, ListTodo, Users } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

export interface WeeklyGoal {
  id: string;
  monthlyGoalId: string;
  goalTitle: string;
  targets: TargetType[];
  weekNumber?: number; // Week number within the month (1-4)
}

export interface TargetType {
  id: string;
  title: string;
  actionSteps: string[];
}

interface DailyTask {
  id: string;
  weeklyGoalId: string;
  targetId: string;
  status: 'To Do' | 'In Progress' | 'Done';
}

interface WeeklyPlanningProps {
  weeklyGoals: WeeklyGoal[];
  monthlyGoals: Array<{ id: string; title: string }>;
  dailyTasks?: DailyTask[];
  onAddWeeklyGoal: (goal: Omit<WeeklyGoal, 'id'>) => void;
  onUpdateWeeklyGoal?: (goal: WeeklyGoal) => void;
  onResetWeeklyGoal?: (goalId: string) => void;
  onDeleteWeeklyGoal?: (goalId: string) => void;
}

export default function WeeklyPlanning({ weeklyGoals, monthlyGoals, dailyTasks = [], onAddWeeklyGoal, onUpdateWeeklyGoal, onResetWeeklyGoal, onDeleteWeeklyGoal }: WeeklyPlanningProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMonthlyGoal, setSelectedMonthlyGoal] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(now.setDate(diff));
  });
  const [targets, setTargets] = useState<Array<{ title: string; actionSteps: string }>>([
    { title: '', actionSteps: '' },
    { title: '', actionSteps: '' },
    { title: '', actionSteps: '' }
  ]);

  // Expand dialog state
  const [expandedGoal, setExpandedGoal] = useState<WeeklyGoal | null>(null);
  const [editingGoalTitle, setEditingGoalTitle] = useState('');
  const [editingTargets, setEditingTargets] = useState<Array<{ id: string; title: string; actionSteps: string }>>([]);

  const handleExpand = (goal: WeeklyGoal) => {
    setExpandedGoal(goal);
    setEditingGoalTitle(goal.goalTitle);
    setEditingTargets(goal.targets.map(t => ({
      id: t.id,
      title: t.title,
      actionSteps: t.actionSteps.join('\n')
    })));
  };

  const handleSaveExpanded = () => {
    if (expandedGoal && onUpdateWeeklyGoal) {
      const updatedGoal: WeeklyGoal = {
        ...expandedGoal,
        goalTitle: editingGoalTitle,
        targets: editingTargets.map(t => ({
          id: t.id,
          title: t.title,
          actionSteps: t.actionSteps.split('\n').filter(step => step.trim() !== '')
        }))
      };
      onUpdateWeeklyGoal(updatedGoal);
      setExpandedGoal(null);
    }
  };

  const handleReset = (goalId: string) => {
    if (onResetWeeklyGoal) {
      onResetWeeklyGoal(goalId);
    }
  };

  // Calculate progress for a weekly goal based on linked daily tasks
  const getWeeklyGoalProgress = (goalId: string): number => {
    const linkedTasks = dailyTasks.filter(task => task.weeklyGoalId === goalId);
    if (linkedTasks.length === 0) return 0;
    const completedTasks = linkedTasks.filter(task => task.status === 'Done').length;
    return Math.round((completedTasks / linkedTasks.length) * 100);
  };

  // Calculate progress for a specific target
  const getTargetProgress = (goalId: string, targetId: string): { completed: number; total: number; percentage: number } => {
    const linkedTasks = dailyTasks.filter(task => task.weeklyGoalId === goalId && task.targetId === targetId);
    if (linkedTasks.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completedTasks = linkedTasks.filter(task => task.status === 'Done').length;
    return {
      completed: completedTasks,
      total: linkedTasks.length,
      percentage: Math.round((completedTasks / linkedTasks.length) * 100)
    };
  };

  const handleSubmit = () => {
    if (selectedMonthlyGoal && goalTitle) {
      const validTargets = targets
        .filter(t => t.title.trim() !== '')
        .map(t => ({
          id: Math.random().toString(36).substr(2, 9),
          title: t.title,
          actionSteps: t.actionSteps.split('\n').filter(step => step.trim() !== '')
        }));

      onAddWeeklyGoal({
        monthlyGoalId: selectedMonthlyGoal,
        goalTitle,
        targets: validTargets
      });

      setSelectedMonthlyGoal('');
      setGoalTitle('');
      setTargets([
        { title: '', actionSteps: '' },
        { title: '', actionSteps: '' },
        { title: '', actionSteps: '' }
      ]);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="tracking-wide text-black font-semibold" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '2.4rem' }}>WEEKLY PLANNING</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-[#1a5f4a] hover:bg-[#145242]">
              <Plus className="w-4 h-4" />
              Create Weekly Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Weekly Goal from Monthly Objective</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyGoal">Select Monthly Goal *</Label>
                <select
                  id="monthlyGoal"
                  value={selectedMonthlyGoal}
                  onChange={(e) => setSelectedMonthlyGoal(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose a monthly goal...</option>
                  {monthlyGoals.map(goal => (
                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalTitle">Weekly Goal Title *</Label>
                <Input
                  id="goalTitle"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g., Complete website design phase"
                />
              </div>
              <div className="space-y-4">
                <Label>Break down your goal into 3 simple targets</Label>
                {targets.map((target, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-sm">Target {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Input
                        value={target.title}
                        onChange={(e) => {
                          const newTargets = [...targets];
                          newTargets[index].title = e.target.value;
                          setTargets(newTargets);
                        }}
                        placeholder={`Target ${index + 1} title`}
                      />
                      <Textarea
                        value={target.actionSteps}
                        onChange={(e) => {
                          const newTargets = [...targets];
                          newTargets[index].actionSteps = e.target.value;
                          setTargets(newTargets);
                        }}
                        placeholder="Action steps (one per line)&#10;e.g.:&#10;- Research design trends&#10;- Create wireframes&#10;- Get team feedback"
                        rows={4}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create Weekly Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant={viewMode === 'kanban' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('kanban')}
          className={viewMode === 'kanban' ? 'bg-[#1a5f4a] hover:bg-[#145242]' : ''}
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Board
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('calendar')}
          className={viewMode === 'calendar' ? 'bg-[#1a5f4a] hover:bg-[#145242]' : ''}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Calendar
        </Button>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <WeeklyCalendarView
          weeklyGoals={weeklyGoals}
          monthlyGoals={monthlyGoals}
          weekStartDate={weekStartDate}
          setWeekStartDate={setWeekStartDate}
          getWeeklyGoalProgress={getWeeklyGoalProgress}
          onGoalClick={handleExpand}
        />
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
      <>
      {weeklyGoals.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No weekly goals yet. Break down your monthly goals into weekly targets!</p>
          {monthlyGoals.length === 0 ? (
            <p className="text-sm text-gray-400">Create monthly goals first to get started.</p>
          ) : (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Weekly Goal
            </Button>
          )}
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {weeklyGoals.map((weeklyGoal) => {
            const monthlyGoal = monthlyGoals.find(g => g.id === weeklyGoal.monthlyGoalId);
            return (
              <div key={weeklyGoal.id} className="flex-shrink-0 w-72">
                {/* Trello-style Column - White card with subtle shadow */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  {/* Column Header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 text-sm">{weeklyGoal.goalTitle}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-[#1a5f4a] hover:bg-gray-100">
                        <Plus className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Weekly Goal</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{weeklyGoal.goalTitle}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteWeeklyGoal?.(weeklyGoal.id)} className="bg-red-500 hover:bg-red-600">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  {/* Cards Container */}
                  <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto bg-gray-50/50">
                    {/* Monthly Goal Reference Card */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                      <div className="h-1.5 bg-[#1a5f4a]" />
                      <div className="p-3">
                        <p className="text-xs text-gray-500 mb-1">Monthly Goal</p>
                        <p className="text-sm font-medium text-gray-700">{monthlyGoal?.title || 'Unknown Goal'}</p>
                      </div>
                    </div>
                    
                    {/* Target Cards */}
                    {weeklyGoal.targets.map((target) => {
                      const targetProgress = getTargetProgress(weeklyGoal.id, target.id);
                      const isComplete = targetProgress.percentage === 100;
                      return (
                        <div 
                          key={target.id} 
                          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                          onClick={() => handleExpand(weeklyGoal)}
                        >
                          {/* Color Label */}
                          <div className={cn(
                            "h-1.5",
                            isComplete ? "bg-[#1a5f4a]" : 
                            targetProgress.percentage > 0 ? "bg-yellow-400" : "bg-orange-400"
                          )} />
                          
                          <div className="p-3">
                            {/* Target Title */}
                            <p className="font-medium text-gray-800 text-sm mb-2">{target.title}</p>
                            
                            {/* Action Steps Preview */}
                            {target.actionSteps.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-500 line-clamp-2">
                                  {target.actionSteps.slice(0, 2).join(' • ')}
                                  {target.actionSteps.length > 2 && ' ...'}
                                </p>
                              </div>
                            )}
                            
                            {/* Card Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                {/* Due/Status Badge */}
                                {targetProgress.total > 0 ? (
                                  <div className={cn(
                                    "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                                    isComplete 
                                      ? "bg-[#1a5f4a]/10 text-[#1a5f4a]" 
                                      : "bg-gray-100 text-gray-600"
                                  )}>
                                    <Calendar className="w-3 h-3" />
                                    <span>{targetProgress.completed}/{targetProgress.total}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                                    <ListTodo className="w-3 h-3" />
                                    <span>{target.actionSteps.length} steps</span>
                                  </div>
                                )}
                                
                                {/* Progress Indicator */}
                                {targetProgress.total > 0 && (
                                  <div className="flex items-center gap-1">
                                    <ListTodo className="w-3 h-3 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Avatar Placeholder */}
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1a5f4a]/10 to-[#1a5f4a]/20 flex items-center justify-center">
                                <Users className="w-3 h-3 text-[#1a5f4a]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Add Card Button */}
                  <div className="p-2 pt-0 bg-gray-50/50">
                    <button 
                      onClick={() => handleExpand(weeklyGoal)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-[#1a5f4a] hover:bg-gray-100 rounded-lg transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add a target</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Add New Column Button */}
          <div className="flex-shrink-0 w-72">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="w-full h-12 flex items-center justify-center gap-2 bg-[#1a5f4a]/10 hover:bg-[#1a5f4a]/20 rounded-xl border-2 border-dashed border-[#1a5f4a]/30 text-[#1a5f4a] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium text-sm">Add Weekly Goal</span>
            </button>
          </div>
        </div>
      )}
      </>
      )}

      {/* Expand Dialog */}
      <Dialog open={expandedGoal !== null} onOpenChange={(open) => !open && setExpandedGoal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Edit Weekly Goal</span>
            </DialogTitle>
          </DialogHeader>
          {expandedGoal && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From Monthly Goal</Label>
                <p className="text-lg font-medium text-gray-700">
                  {monthlyGoals.find(g => g.id === expandedGoal.monthlyGoalId)?.title || 'Unknown Goal'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editGoalTitle">Weekly Goal Title</Label>
                <Input
                  id="editGoalTitle"
                  value={editingGoalTitle}
                  onChange={(e) => setEditingGoalTitle(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold">Targets & Action Steps</Label>
                <div className="grid gap-4">
                  {editingTargets.map((target, index) => (
                    <Card key={target.id} className="border-2">
                      <CardHeader className="bg-gray-50 py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" />
                          Target {index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500">Target Title</Label>
                          <Input
                            value={target.title}
                            onChange={(e) => {
                              const newTargets = [...editingTargets];
                              newTargets[index].title = e.target.value;
                              setEditingTargets(newTargets);
                            }}
                            placeholder="Target title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500">Action Steps (one per line)</Label>
                          <Textarea
                            value={target.actionSteps}
                            onChange={(e) => {
                              const newTargets = [...editingTargets];
                              newTargets[index].actionSteps = e.target.value;
                              setEditingTargets(newTargets);
                            }}
                            placeholder="Enter action steps, one per line"
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setExpandedGoal(null)}>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleSaveExpanded}>
                  <Save className="w-4 h-4 mr-1" />
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

// Weekly Calendar View Component
function WeeklyCalendarView({
  weeklyGoals,
  monthlyGoals,
  weekStartDate,
  setWeekStartDate,
  getWeeklyGoalProgress,
  onGoalClick
}: {
  weeklyGoals: WeeklyGoal[];
  monthlyGoals: Array<{ id: string; title: string }>;
  weekStartDate: Date;
  setWeekStartDate: (date: Date) => void;
  getWeeklyGoalProgress: (goalId: string) => number;
  onGoalClick: (goal: WeeklyGoal) => void;
}) {
  // Get week days
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStartDate);
      day.setDate(weekStartDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const prevWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(weekStartDate.getDate() - 7);
    setWeekStartDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(weekStartDate.getDate() + 7);
    setWeekStartDate(newDate);
  };

  const goToCurrentWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    setWeekStartDate(new Date(now.setDate(diff)));
  };

  const today = new Date();
  const isToday = (date: Date) => {
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Format week range for header
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  const weekRange = `${monthNames[weekStartDate.getMonth()]} ${weekStartDate.getDate()} - ${monthNames[weekEndDate.getMonth()]} ${weekEndDate.getDate()}, ${weekEndDate.getFullYear()}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">{weekRange}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 divide-x divide-gray-100">
        {weekDays.map((day, idx) => (
          <div key={idx} className="flex flex-col">
            {/* Day Header */}
            <div className={cn(
              "px-3 py-2 text-center border-b border-gray-100",
              isToday(day) ? "bg-[#1a5f4a] text-white" : "bg-gray-50"
            )}>
              <div className="text-xs font-medium">{dayNames[idx]}</div>
              <div className={cn(
                "text-lg font-semibold",
                isToday(day) ? "text-white" : "text-gray-800"
              )}>{day.getDate()}</div>
            </div>

            {/* Day Content */}
            <div className="flex-1 min-h-[300px] p-2 space-y-2 bg-white">
              {weeklyGoals.map((goal) => {
                const progress = getWeeklyGoalProgress(goal.id);
                const monthlyGoal = monthlyGoals.find(g => g.id === goal.monthlyGoalId);
                
                // Show all goals on all days for now (can be customized to specific dates)
                if (idx === 0) { // Show goals starting on Monday
                  return (
                    <div
                      key={goal.id}
                      onClick={() => onGoalClick(goal)}
                      className="p-2 bg-gradient-to-r from-[#1a5f4a]/5 to-[#1a5f4a]/10 rounded-lg border border-[#1a5f4a]/20 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <p className="text-xs font-medium text-gray-800 mb-1 truncate">{goal.goalTitle}</p>
                      <p className="text-xs text-gray-500 truncate">{monthlyGoal?.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1a5f4a] rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{progress}%</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Target className="w-3 h-3 text-[#1a5f4a]" />
                        <span className="text-xs text-gray-500">{goal.targets.length} targets</span>
                      </div>
                    </div>
                  );
                }
                
                // Show target cards spread across the week
                const targetForDay = goal.targets[idx % goal.targets.length];
                if (targetForDay && idx < goal.targets.length) {
                  return (
                    <div
                      key={`${goal.id}-${idx}`}
                      onClick={() => onGoalClick(goal)}
                      className="p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md hover:border-[#1a5f4a]/30 transition-all"
                    >
                      <p className="text-xs font-medium text-gray-700 truncate">{targetForDay.title}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <ListTodo className="w-3 h-3" />
                        <span>{targetForDay.actionSteps.length} steps</span>
                      </div>
                    </div>
                  );
                }
                
                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#1a5f4a]"></div>
          <span className="text-sm text-gray-600">Weekly Goal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-gray-300"></div>
          <span className="text-sm text-gray-600">Target</span>
        </div>
      </div>
    </div>
  );
}