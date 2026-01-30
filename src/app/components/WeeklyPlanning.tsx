import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { Plus, ChevronDown, Maximize2, RotateCcw, Target, CheckCircle2, X, Save, Trash2 } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

export interface WeeklyGoal {
  id: string;
  monthlyGoalId: string;
  goalTitle: string;
  targets: TargetType[];
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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="tracking-wide mb-3 text-black font-semibold" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '2.4rem' }}>WEEKLY PLANNING</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
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
        <div className="space-y-8">
          {weeklyGoals.map((weeklyGoal) => {
            const monthlyGoal = monthlyGoals.find(g => g.id === weeklyGoal.monthlyGoalId);
            return (
              <div key={weeklyGoal.id} className="space-y-4">
                <Card className="border-2 border-gray-300">
                  <CardHeader className="bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">FROM MONTHLY GOAL</p>
                        <CardTitle className="text-lg">{monthlyGoal?.title || 'Unknown Goal'}</CardTitle>
                      </div>
                      {onDeleteWeeklyGoal && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
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
                              <AlertDialogAction onClick={() => onDeleteWeeklyGoal(weeklyGoal.id)} className="bg-red-500 hover:bg-red-600">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="border-2 border-primary bg-accent/50 p-4 mb-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Weekly Goal</Label>
                        {(() => {
                          const progress = getWeeklyGoalProgress(weeklyGoal.id);
                          return (
                            <div className="flex items-center gap-2">
                              {progress === 100 ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : null}
                              <span className={cn(
                                "text-sm font-semibold",
                                progress === 100 ? "text-green-600" : "text-gray-600"
                              )}>
                                {progress}%
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                      <p className="text-lg font-medium mb-3">{weeklyGoal.goalTitle}</p>
                      <Progress value={getWeeklyGoalProgress(weeklyGoal.id)} className="h-2" />
                    </div>
                    <div className="flex items-center justify-center my-4">
                      <div className="flex flex-col items-center gap-1">
                        <ChevronDown className="w-5 h-5 text-primary" />
                        <span className="text-xs text-gray-500 font-medium px-3 py-1 bg-gray-100 rounded-full">Break into targets</span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                      {weeklyGoal.targets.map((target, idx) => {
                        const targetProgress = getTargetProgress(weeklyGoal.id, target.id);
                        return (
                        <Card key={target.id} className={cn(
                          "border-2 hover:border-primary/50 transition-colors",
                          targetProgress.percentage === 100 && "border-green-300 bg-green-50/50"
                        )}>
                          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 py-3">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {targetProgress.percentage === 100 ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Target className="w-4 h-4 text-primary" />
                                )}
                                Target {idx + 1}
                              </div>
                              {targetProgress.total > 0 && (
                                <span className={cn(
                                  "text-xs font-medium px-2 py-0.5 rounded-full",
                                  targetProgress.percentage === 100 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-gray-200 text-gray-600"
                                )}>
                                  {targetProgress.completed}/{targetProgress.total}
                                </span>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="font-semibold text-gray-800 mb-3">{target.title}</p>
                            {targetProgress.total > 0 && (
                              <div className="mb-3">
                                <Progress value={targetProgress.percentage} className="h-1.5" />
                              </div>
                            )}
                            <div className="border-t pt-3 mt-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Action Steps</p>
                              <div className="space-y-2">
                                {target.actionSteps.length === 0 ? (
                                  <p className="text-sm text-gray-400 italic">No action steps yet</p>
                                ) : (
                                  target.actionSteps.map((step, stepIdx) => (
                                    <div key={stepIdx} className="flex gap-2 text-sm items-start">
                                      <CheckCircle2 className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-600">{step}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        );
                      })}
                    </div>
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                      <Button variant="outline" size="sm" className="text-gray-500" onClick={() => handleExpand(weeklyGoal)}>
                        <Maximize2 className="w-4 h-4 mr-1" />
                        Expand
                      </Button>
                      <Button variant="outline" size="sm" className="text-gray-500" onClick={() => handleReset(weeklyGoal.id)}>
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
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