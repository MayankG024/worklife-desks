import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { cn } from '@/app/components/ui/utils';
import { Plus, ChevronLeft, ChevronRight, Target, Calendar, MoreHorizontal, Pencil, Trash2, X, Check } from 'lucide-react';
import { MonthlyGoal } from './MonthlyDashboard';
import { WeeklyGoal } from './WeeklyPlanning';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface GoalsProps {
  monthlyGoals: MonthlyGoal[];
  weeklyGoals: WeeklyGoal[];
  onAddMonthlyGoal: (goal: Omit<MonthlyGoal, 'id'>) => void;
  onUpdateMonthlyGoal: (goalId: string, updates: Partial<MonthlyGoal>) => void;
  onDeleteMonthlyGoal: (goalId: string) => void;
  onAddWeeklyGoal: (goal: Omit<WeeklyGoal, 'id'>) => void;
  onUpdateWeeklyGoal: (goal: WeeklyGoal) => void;
  onDeleteWeeklyGoal: (goalId: string) => void;
}

export default function Goals({
  monthlyGoals,
  weeklyGoals,
  onAddMonthlyGoal,
  onUpdateMonthlyGoal,
  onDeleteMonthlyGoal,
  onAddWeeklyGoal,
  onUpdateWeeklyGoal,
  onDeleteWeeklyGoal,
}: GoalsProps) {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [isAddMonthlyOpen, setIsAddMonthlyOpen] = useState(false);
  const [isAddWeeklyOpen, setIsAddWeeklyOpen] = useState(false);
  const [selectedMonthlyGoalId, setSelectedMonthlyGoalId] = useState<string | null>(null);
  const [editingMonthlyGoal, setEditingMonthlyGoal] = useState<MonthlyGoal | null>(null);
  const [editingWeeklyGoal, setEditingWeeklyGoal] = useState<WeeklyGoal | null>(null);
  
  // Form validation errors
  const [monthlyGoalErrors, setMonthlyGoalErrors] = useState<{title?: string; deadline?: string}>({});
  
  // Delete confirmation states
  const [monthlyGoalToDelete, setMonthlyGoalToDelete] = useState<string | null>(null);
  const [weeklyGoalToDelete, setWeeklyGoalToDelete] = useState<string | null>(null);
  
  // Expanded view states
  const [expandedMonthlyGoal, setExpandedMonthlyGoal] = useState<MonthlyGoal | null>(null);
  const [expandedWeeklyGoal, setExpandedWeeklyGoal] = useState<WeeklyGoal | null>(null);
  
  // Form states for new monthly goal
  const [newMonthlyGoal, setNewMonthlyGoal] = useState({
    title: '',
    why: '',
    resources: '',
    deadline: '',
    outcome: '',
    nextSteps: ['']
  });

  // Form states for new weekly goal
  const [newWeeklyGoal, setNewWeeklyGoal] = useState({
    goalTitle: '',
    weekNumber: 1,
    targets: [{ id: '', title: '', actionSteps: [''] }]
  });

  // Week navigation
  const getWeekLabel = (weekOffset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (weekOffset * 7));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
  };

  const handleAddMonthlyGoal = () => {
    const errors: {title?: string; deadline?: string} = {};
    
    if (!newMonthlyGoal.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (newMonthlyGoal.deadline && new Date(newMonthlyGoal.deadline) < new Date()) {
      errors.deadline = 'Deadline must be in the future';
    }
    
    if (Object.keys(errors).length > 0) {
      setMonthlyGoalErrors(errors);
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    if (newMonthlyGoal.title.trim()) {
      onAddMonthlyGoal({
        title: newMonthlyGoal.title,
        why: newMonthlyGoal.why,
        resources: newMonthlyGoal.resources,
        deadline: newMonthlyGoal.deadline,
        outcome: newMonthlyGoal.outcome,
        nextSteps: newMonthlyGoal.nextSteps.filter(s => s.trim())
      });
      setNewMonthlyGoal({
        title: '',
        why: '',
        resources: '',
        deadline: '',
        outcome: '',
        nextSteps: ['']
      });
      setMonthlyGoalErrors({});
      setIsAddMonthlyOpen(false);
      toast.success('Monthly goal added successfully!');
    }
  };

  const handleAddWeeklyGoal = () => {
    if (selectedMonthlyGoalId && newWeeklyGoal.goalTitle.trim()) {
      onAddWeeklyGoal({
        monthlyGoalId: selectedMonthlyGoalId,
        goalTitle: newWeeklyGoal.goalTitle,
        weekNumber: newWeeklyGoal.weekNumber,
        targets: newWeeklyGoal.targets.map((t, idx) => ({
          id: `target-${Date.now()}-${idx}`,
          title: t.title,
          actionSteps: t.actionSteps.filter(s => s.trim())
        }))
      });
      setNewWeeklyGoal({
        goalTitle: '',
        weekNumber: 1,
        targets: [{ id: '', title: '', actionSteps: [''] }]
      });
      setIsAddWeeklyOpen(false);
      setSelectedMonthlyGoalId(null);
    }
  };

  const handleUpdateMonthlyGoal = () => {
    if (editingMonthlyGoal) {
      onUpdateMonthlyGoal(editingMonthlyGoal.id, editingMonthlyGoal);
      setEditingMonthlyGoal(null);
    }
  };

  const handleUpdateWeeklyGoal = () => {
    if (editingWeeklyGoal) {
      onUpdateWeeklyGoal(editingWeeklyGoal);
      setEditingWeeklyGoal(null);
    }
  };

  // Get weekly goals for a specific monthly goal
  const getWeeklyGoalsForMonthly = (monthlyGoalId: string) => {
    return weeklyGoals.filter(wg => wg.monthlyGoalId === monthlyGoalId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Goals</h1>
          <p className="text-gray-500 text-sm">Monthly goals with nested weekly targets</p>
        </div>
        
        {/* Week Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:border-gray-300 transition-colors">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={() => setSelectedWeek(prev => prev - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {getWeekLabel(selectedWeek)}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0"
              onClick={() => setSelectedWeek(prev => prev + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Dialog open={isAddMonthlyOpen} onOpenChange={setIsAddMonthlyOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1a5f4a] hover:bg-[#164a3a]">
                <Plus className="w-4 h-4 mr-2" />
                Add Monthly Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Monthly Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title *</Label>
                  <Input 
                    value={newMonthlyGoal.title}
                    onChange={(e) => {
                      setNewMonthlyGoal({...newMonthlyGoal, title: e.target.value});
                      if (monthlyGoalErrors.title) setMonthlyGoalErrors({...monthlyGoalErrors, title: undefined});
                    }}
                    placeholder="What do you want to achieve?"
                    className={monthlyGoalErrors.title ? 'border-red-500' : ''}
                  />
                  {monthlyGoalErrors.title && (
                    <p className="text-red-500 text-xs mt-1">{monthlyGoalErrors.title}</p>
                  )}
                </div>
                <div>
                  <Label>Why is this important?</Label>
                  <Textarea 
                    value={newMonthlyGoal.why}
                    onChange={(e) => setNewMonthlyGoal({...newMonthlyGoal, why: e.target.value})}
                    placeholder="Describe the motivation..."
                  />
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input 
                    type="date"
                    value={newMonthlyGoal.deadline}
                    onChange={(e) => {
                      setNewMonthlyGoal({...newMonthlyGoal, deadline: e.target.value});
                      if (monthlyGoalErrors.deadline) setMonthlyGoalErrors({...monthlyGoalErrors, deadline: undefined});
                    }}
                    className={monthlyGoalErrors.deadline ? 'border-red-500' : ''}
                  />
                  {monthlyGoalErrors.deadline && (
                    <p className="text-red-500 text-xs mt-1">{monthlyGoalErrors.deadline}</p>
                  )}
                </div>
                <div>
                  <Label>Expected Outcome</Label>
                  <Textarea 
                    value={newMonthlyGoal.outcome}
                    onChange={(e) => setNewMonthlyGoal({...newMonthlyGoal, outcome: e.target.value})}
                    placeholder="What does success look like?"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsAddMonthlyOpen(false);
                    setMonthlyGoalErrors({});
                  }}>
                    Cancel
                  </Button>
                  <Button className="bg-[#1a5f4a] hover:bg-[#164a3a]" onClick={handleAddMonthlyGoal}>
                    Add Goal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Goals Layout - Monthly on left, Weekly nested on right */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-[280px_1fr] border-b border-gray-200 bg-gray-50">
          <div className="px-4 py-4 border-r border-gray-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1a5f4a]" />
              <span className="font-semibold text-gray-700 text-sm">Monthly Goals</span>
            </div>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#1a5f4a]" />
              <span className="font-semibold text-gray-700 text-sm">Weekly Targets</span>
            </div>
          </div>
        </div>

        {/* Goals Rows */}
        {monthlyGoals.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No monthly goals yet. Add your first goal to get started!</p>
            <Button 
              onClick={() => setIsAddMonthlyOpen(true)}
              className="bg-[#1a5f4a] hover:bg-[#164a3a]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Monthly Goal
            </Button>
          </div>
        ) : (
          monthlyGoals.map((monthlyGoal, index) => {
            const weeklyGoalsForThisMonth = getWeeklyGoalsForMonthly(monthlyGoal.id);
            
            return (
              <div 
                key={monthlyGoal.id} 
                className={cn(
                  "grid grid-cols-[280px_1fr]",
                  index !== monthlyGoals.length - 1 && "border-b border-gray-200"
                )}
              >
                {/* Monthly Goal Card */}
                <div className="p-4 border-r border-gray-200 bg-gray-50/50">
                  <Card 
                    className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-gray-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight pr-2">
                        {monthlyGoal.title}
                      </h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                          >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => setEditingMonthlyGoal(monthlyGoal)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setExpandedMonthlyGoal(monthlyGoal)}>
                            <Target className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedMonthlyGoalId(monthlyGoal.id);
                              setIsAddWeeklyOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Weekly Target
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setMonthlyGoalToDelete(monthlyGoal.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {monthlyGoal.deadline && (
                      <p className="text-xs text-gray-500 mb-2">
                        Due: {new Date(monthlyGoal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                    {monthlyGoal.why && (
                      <p className="text-xs text-gray-600 line-clamp-2">{monthlyGoal.why}</p>
                    )}
                  </Card>
                </div>

                {/* Weekly Goals for this Monthly Goal */}
                <div className="p-4 min-h-[100px]">
                  {weeklyGoalsForThisMonth.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-gray-500 border-dashed hover:border-solid hover:bg-gray-50 transition-all"
                        onClick={() => {
                          setSelectedMonthlyGoalId(monthlyGoal.id);
                          setIsAddWeeklyOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Weekly Target
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {weeklyGoalsForThisMonth.map((weeklyGoal, index) => (
                        <Card 
                          key={weeklyGoal.id} 
                          className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-gray-300 flex-shrink-0 w-[200px]"
                        >
                          {/* Week Tag */}
                          <div className="mb-2">
                            <span className="text-[10px] font-semibold text-[#1a5f4a] bg-[#1a5f4a]/10 px-2 py-0.5 rounded-full">
                              Week {weeklyGoal.weekNumber || index + 1}
                            </span>
                          </div>
                          
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-800 text-sm leading-tight pr-2">
                              {weeklyGoal.goalTitle}
                            </h4>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button 
                                  className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem 
                                  onClick={() => setEditingWeeklyGoal(weeklyGoal)}
                                >
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setExpandedWeeklyGoal(weeklyGoal)}
                                >
                                  <Target className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setWeeklyGoalToDelete(weeklyGoal.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {/* Targets as checkboxes */}
                          <div className="space-y-1.5">
                            {weeklyGoal.targets.slice(0, 3).map((target) => (
                              <div key={target.id} className="flex items-start gap-2">
                                <Checkbox
                                  checked={target.completed || false}
                                  onCheckedChange={(checked) => {
                                    const updatedTargets = weeklyGoal.targets.map(t => 
                                      t.id === target.id ? { ...t, completed: checked as boolean } : t
                                    );
                                    onUpdateWeeklyGoal({ ...weeklyGoal, targets: updatedTargets });
                                  }}
                                  className="h-3.5 w-3.5 mt-0.5"
                                />
                                <span className={cn(
                                  "text-xs text-gray-600 line-clamp-1",
                                  target.completed && "line-through text-gray-400"
                                )}>
                                  {target.title}
                                </span>
                              </div>
                            ))}
                            {weeklyGoal.targets.length > 3 && (
                              <span className="text-xs text-gray-400">+{weeklyGoal.targets.length - 3} more</span>
                            )}
                          </div>
                        </Card>
                      ))}
                      
                      {/* Add button */}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-auto py-6 px-4 text-gray-500 border-dashed flex-shrink-0"
                        onClick={() => {
                          setSelectedMonthlyGoalId(monthlyGoal.id);
                          setIsAddWeeklyOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Weekly Goal Dialog */}
      <Dialog open={isAddWeeklyOpen} onOpenChange={setIsAddWeeklyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Weekly Target</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Target Title</Label>
              <Input 
                value={newWeeklyGoal.goalTitle}
                onChange={(e) => setNewWeeklyGoal({...newWeeklyGoal, goalTitle: e.target.value})}
                placeholder="What's your weekly target?"
              />
            </div>
            <div>
              <Label>Week</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4].map((week) => (
                  <Button
                    key={week}
                    type="button"
                    variant={newWeeklyGoal.weekNumber === week ? "default" : "outline"}
                    size="sm"
                    className={newWeeklyGoal.weekNumber === week ? "bg-[#1a5f4a] hover:bg-[#164a3a]" : ""}
                    onClick={() => setNewWeeklyGoal({...newWeeklyGoal, weekNumber: week})}
                  >
                    Week {week}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Sub-targets</Label>
              <div className="space-y-2 mt-2">
                {newWeeklyGoal.targets.map((target, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input 
                      value={target.title}
                      onChange={(e) => {
                        const newTargets = [...newWeeklyGoal.targets];
                        newTargets[idx].title = e.target.value;
                        setNewWeeklyGoal({...newWeeklyGoal, targets: newTargets});
                      }}
                      placeholder={`Sub-target ${idx + 1}`}
                    />
                    {newWeeklyGoal.targets.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          const newTargets = newWeeklyGoal.targets.filter((_, i) => i !== idx);
                          setNewWeeklyGoal({...newWeeklyGoal, targets: newTargets});
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setNewWeeklyGoal({
                      ...newWeeklyGoal, 
                      targets: [...newWeeklyGoal.targets, { id: '', title: '', actionSteps: [''] }]
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Sub-target
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddWeeklyOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-[#1a5f4a] hover:bg-[#164a3a]" onClick={handleAddWeeklyGoal}>
                Add Target
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Monthly Goal Dialog */}
      <Dialog open={!!editingMonthlyGoal} onOpenChange={(open) => !open && setEditingMonthlyGoal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Monthly Goal</DialogTitle>
          </DialogHeader>
          {editingMonthlyGoal && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input 
                  value={editingMonthlyGoal.title}
                  onChange={(e) => setEditingMonthlyGoal({...editingMonthlyGoal, title: e.target.value})}
                />
              </div>
              <div>
                <Label>Why is this important?</Label>
                <Textarea 
                  value={editingMonthlyGoal.why}
                  onChange={(e) => setEditingMonthlyGoal({...editingMonthlyGoal, why: e.target.value})}
                />
              </div>
              <div>
                <Label>Deadline</Label>
                <Input 
                  type="date"
                  value={editingMonthlyGoal.deadline}
                  onChange={(e) => setEditingMonthlyGoal({...editingMonthlyGoal, deadline: e.target.value})}
                />
              </div>
              <div>
                <Label>Expected Outcome</Label>
                <Textarea 
                  value={editingMonthlyGoal.outcome}
                  onChange={(e) => setEditingMonthlyGoal({...editingMonthlyGoal, outcome: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingMonthlyGoal(null)}>
                  Cancel
                </Button>
                <Button className="bg-[#1a5f4a] hover:bg-[#164a3a]" onClick={handleUpdateMonthlyGoal}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Weekly Goal Dialog */}
      <Dialog open={!!editingWeeklyGoal} onOpenChange={(open) => !open && setEditingWeeklyGoal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Weekly Target</DialogTitle>
          </DialogHeader>
          {editingWeeklyGoal && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Target Title</Label>
                <Input 
                  value={editingWeeklyGoal.goalTitle}
                  onChange={(e) => setEditingWeeklyGoal({...editingWeeklyGoal, goalTitle: e.target.value})}
                />
              </div>
              <div>
                <Label>Week</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4].map((week) => (
                    <Button
                      key={week}
                      type="button"
                      variant={(editingWeeklyGoal.weekNumber || 1) === week ? "default" : "outline"}
                      size="sm"
                      className={(editingWeeklyGoal.weekNumber || 1) === week ? "bg-[#1a5f4a] hover:bg-[#164a3a]" : ""}
                      onClick={() => setEditingWeeklyGoal({...editingWeeklyGoal, weekNumber: week})}
                    >
                      Week {week}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Sub-targets</Label>
                <div className="space-y-2 mt-2">
                  {editingWeeklyGoal.targets.map((target, idx) => (
                    <div key={target.id || idx} className="flex gap-2">
                      <Input 
                        value={target.title}
                        onChange={(e) => {
                          const newTargets = [...editingWeeklyGoal.targets];
                          newTargets[idx].title = e.target.value;
                          setEditingWeeklyGoal({...editingWeeklyGoal, targets: newTargets});
                        }}
                      />
                      {editingWeeklyGoal.targets.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newTargets = editingWeeklyGoal.targets.filter((_, i) => i !== idx);
                            setEditingWeeklyGoal({...editingWeeklyGoal, targets: newTargets});
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingWeeklyGoal({
                        ...editingWeeklyGoal, 
                        targets: [...editingWeeklyGoal.targets, { 
                          id: `target-${Date.now()}`, 
                          title: '', 
                          actionSteps: [] 
                        }]
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Sub-target
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingWeeklyGoal(null)}>
                  Cancel
                </Button>
                <Button className="bg-[#1a5f4a] hover:bg-[#164a3a]" onClick={handleUpdateWeeklyGoal}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Expanded Monthly Goal View - Editable */}
      <Dialog open={!!expandedMonthlyGoal} onOpenChange={(open) => !open && setExpandedMonthlyGoal(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Monthly Goal</DialogTitle>
          </DialogHeader>
          {expandedMonthlyGoal && (
            <div className="space-y-4 mt-4">
              {/* Title */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Goal Title</Label>
                <Input 
                  value={expandedMonthlyGoal.title}
                  onChange={(e) => setExpandedMonthlyGoal({...expandedMonthlyGoal, title: e.target.value})}
                  className="mt-1"
                  placeholder="What do you want to achieve?"
                />
              </div>

              {/* Deadline */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Deadline</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <Input 
                    type="date"
                    value={expandedMonthlyGoal.deadline || ''}
                    onChange={(e) => setExpandedMonthlyGoal({...expandedMonthlyGoal, deadline: e.target.value})}
                    className="flex-1"
                  />
                </div>
              </div>
              
              {/* Why */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Why is this important?</Label>
                <Textarea 
                  value={expandedMonthlyGoal.why || ''}
                  onChange={(e) => setExpandedMonthlyGoal({...expandedMonthlyGoal, why: e.target.value})}
                  className="mt-1"
                  placeholder="Describe the motivation behind this goal..."
                  rows={3}
                />
              </div>
              
              {/* Expected Outcome */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Expected Outcome</Label>
                <Textarea 
                  value={expandedMonthlyGoal.outcome || ''}
                  onChange={(e) => setExpandedMonthlyGoal({...expandedMonthlyGoal, outcome: e.target.value})}
                  className="mt-1"
                  placeholder="What does success look like?"
                  rows={3}
                />
              </div>
              
              {/* Resources */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Resources Needed</Label>
                <Textarea 
                  value={expandedMonthlyGoal.resources || ''}
                  onChange={(e) => setExpandedMonthlyGoal({...expandedMonthlyGoal, resources: e.target.value})}
                  className="mt-1"
                  placeholder="What resources do you need?"
                  rows={2}
                />
              </div>
              
              {/* Next Steps */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Next Steps</Label>
                <div className="space-y-2 mt-2">
                  {(expandedMonthlyGoal.nextSteps || ['']).map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input 
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...(expandedMonthlyGoal.nextSteps || [''])];
                          newSteps[idx] = e.target.value;
                          setExpandedMonthlyGoal({...expandedMonthlyGoal, nextSteps: newSteps});
                        }}
                        placeholder={`Step ${idx + 1}`}
                      />
                      {(expandedMonthlyGoal.nextSteps || []).length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newSteps = (expandedMonthlyGoal.nextSteps || []).filter((_, i) => i !== idx);
                            setExpandedMonthlyGoal({...expandedMonthlyGoal, nextSteps: newSteps});
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setExpandedMonthlyGoal({
                        ...expandedMonthlyGoal, 
                        nextSteps: [...(expandedMonthlyGoal.nextSteps || []), '']
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Step
                  </Button>
                </div>
              </div>

              {/* Weekly Goals linked to this monthly goal */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Weekly Targets</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedMonthlyGoalId(expandedMonthlyGoal.id);
                      setIsAddWeeklyOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Weekly Target
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {weeklyGoals.filter(wg => wg.monthlyGoalId === expandedMonthlyGoal.id).map((wg, idx) => (
                    <div 
                      key={wg.id} 
                      className="bg-[#1a5f4a]/5 border border-[#1a5f4a]/20 rounded-lg p-3 text-sm cursor-pointer hover:border-[#1a5f4a]/40 transition-colors"
                      onClick={() => {
                        setExpandedWeeklyGoal(wg);
                      }}
                    >
                      <span className="text-[10px] font-semibold text-[#1a5f4a] bg-[#1a5f4a]/10 px-2 py-0.5 rounded-full">
                        Week {wg.weekNumber || idx + 1}
                      </span>
                      <p className="mt-1 font-medium text-gray-800">{wg.goalTitle}</p>
                      <p className="text-xs text-gray-500 mt-1">{wg.targets.length} sub-targets</p>
                    </div>
                  ))}
                  {weeklyGoals.filter(wg => wg.monthlyGoalId === expandedMonthlyGoal.id).length === 0 && (
                    <p className="text-sm text-gray-500">No weekly targets yet</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between gap-2 pt-4 border-t">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Goal
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Monthly Goal?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete the goal and all associated weekly targets. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          onDeleteMonthlyGoal(expandedMonthlyGoal.id);
                          setExpandedMonthlyGoal(null);
                        }}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setExpandedMonthlyGoal(null)}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-[#1a5f4a] hover:bg-[#164a3a]" 
                    onClick={() => {
                      onUpdateMonthlyGoal(expandedMonthlyGoal.id, expandedMonthlyGoal);
                      setExpandedMonthlyGoal(null);
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Expanded Weekly Goal View */}
      <Dialog open={!!expandedWeeklyGoal} onOpenChange={(open) => !open && setExpandedWeeklyGoal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1a5f4a] bg-[#1a5f4a]/10 px-2 py-0.5 rounded-full">
                Week {expandedWeeklyGoal?.weekNumber || 1}
              </span>
            </div>
            <DialogTitle className="text-xl mt-2">{expandedWeeklyGoal?.goalTitle}</DialogTitle>
          </DialogHeader>
          {expandedWeeklyGoal && (
            <div className="space-y-4 mt-4">
              {/* Parent Monthly Goal */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Monthly Goal</p>
                <p className="text-sm font-medium text-gray-700">
                  {monthlyGoals.find(mg => mg.id === expandedWeeklyGoal.monthlyGoalId)?.title || 'Unknown'}
                </p>
              </div>
              
              {/* Targets/Sub-targets */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Sub-targets ({expandedWeeklyGoal.targets.length})</h4>
                <div className="space-y-2">
                  {expandedWeeklyGoal.targets.map((target, idx) => (
                    <div key={target.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 mt-0.5 rounded border-2 border-[#1a5f4a] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-[#1a5f4a]">{idx + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{target.title}</p>
                          {target.actionSteps && target.actionSteps.length > 0 && (
                            <div className="mt-2 pl-2 border-l-2 border-gray-200">
                              {target.actionSteps.map((step, stepIdx) => (
                                <p key={stepIdx} className="text-xs text-gray-500 py-0.5">{step}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setExpandedWeeklyGoal(null)}>
                  Close
                </Button>
                <Button 
                  className="bg-[#1a5f4a] hover:bg-[#164a3a]" 
                  onClick={() => {
                    setEditingWeeklyGoal(expandedWeeklyGoal);
                    setExpandedWeeklyGoal(null);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Target
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Monthly Goal Confirmation */}
      <AlertDialog open={!!monthlyGoalToDelete} onOpenChange={(open) => !open && setMonthlyGoalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Monthly Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this monthly goal? This will also delete all associated weekly targets. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMonthlyGoalToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (monthlyGoalToDelete) {
                  onDeleteMonthlyGoal(monthlyGoalToDelete);
                  setMonthlyGoalToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Weekly Goal Confirmation */}
      <AlertDialog open={!!weeklyGoalToDelete} onOpenChange={(open) => !open && setWeeklyGoalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Weekly Target</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this weekly target? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWeeklyGoalToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (weeklyGoalToDelete) {
                  onDeleteWeeklyGoal(weeklyGoalToDelete);
                  setWeeklyGoalToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
