import { useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Plus, Menu, MoreHorizontal, CheckCircle, ArrowLeft, Lightbulb, CalendarIcon, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

type GoalStatus = 'in-progress' | 'on-track' | 'at-risk';

export interface MonthlyGoal {
  id: string;
  title: string;
  why: string;
  resources: string;
  deadline: string;
  outcome: string;
  nextSteps: string[];
  status?: GoalStatus;
  project?: string;
  kpi?: string;
  teamLeader?: string;
  notes?: string;
  risk?: string;
  completed?: boolean;
}

interface WeeklyGoalProgress {
  id: string;
  monthlyGoalId: string;
  goalTitle: string;
  progress: number;
}

interface MonthlyDashboardProps {
  goals: MonthlyGoal[];
  onAddGoal: (goal: Omit<MonthlyGoal, 'id'>) => void;
  onDeleteGoal?: (goalId: string) => void;
  onUpdateGoal?: (goalId: string, updates: Partial<MonthlyGoal>) => void;
  currentMonth: string;
  weeklyGoalsProgress?: WeeklyGoalProgress[];
}

export default function MonthlyDashboard({ goals, onAddGoal, onDeleteGoal, onUpdateGoal, currentMonth, weeklyGoalsProgress = [] }: MonthlyDashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<MonthlyGoal | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [newGoal, setNewGoal] = useState({
    title: '',
    why: '',
    resources: '',
    deadline: '',
    outcome: '',
    nextSteps: '',
    status: 'in-progress' as GoalStatus,
    project: '',
    kpi: '',
    teamLeader: '',
    notes: '',
    risk: ''
  });

  // Calculate monthly goal progress based on linked weekly goals
  const getMonthlyGoalProgress = (goalId: string): number => {
    const linkedWeeklyGoals = weeklyGoalsProgress.filter(wg => wg.monthlyGoalId === goalId);
    if (linkedWeeklyGoals.length === 0) return 0;
    const totalProgress = linkedWeeklyGoals.reduce((sum, wg) => sum + wg.progress, 0);
    return Math.round(totalProgress / linkedWeeklyGoals.length);
  };

  // Count goals by status
  const statusCounts = {
    'in-progress': goals.filter(g => (g.status || 'in-progress') === 'in-progress').length,
    'on-track': goals.filter(g => g.status === 'on-track').length,
    'at-risk': goals.filter(g => g.status === 'at-risk').length
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case 'on-track': return 'bg-green-500';
      case 'at-risk': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusTextColor = (status: GoalStatus) => {
    switch (status) {
      case 'on-track': return 'text-green-600';
      case 'at-risk': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusLabel = (status: GoalStatus) => {
    switch (status) {
      case 'on-track': return 'On Track';
      case 'at-risk': return 'At Risk';
      default: return 'In Progress';
    }
  };

  const getCheckboxStyle = (status: GoalStatus, completed?: boolean) => {
    if (completed) {
      return 'bg-green-500 border-green-500';
    }
    switch (status) {
      case 'on-track': return 'border-green-500';
      case 'at-risk': return 'bg-red-100 border-red-500';
      default: return 'border-gray-300';
    }
  };

  const handleSubmit = () => {
    if (newGoal.title && newGoal.deadline) {
      onAddGoal({
        ...newGoal,
        nextSteps: newGoal.nextSteps.split('\n').filter(step => step.trim() !== '')
      });
      setNewGoal({
        title: '',
        why: '',
        resources: '',
        deadline: '',
        outcome: '',
        nextSteps: '',
        status: 'in-progress',
        project: '',
        kpi: '',
        teamLeader: '',
        notes: '',
        risk: ''
      });
      setIsDialogOpen(false);
    }
  };

  const toggleGoalCompletion = (goalId: string, currentCompleted?: boolean) => {
    if (onUpdateGoal) {
      onUpdateGoal(goalId, { completed: !currentCompleted });
    }
  };

  // Parse current month for display
  const monthDisplay = currentMonth || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto flex gap-6">
        {/* Main Panel - Goals List */}
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100">
                  <Menu className="w-5 h-5 text-gray-600" />
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800">Monthly Goals</h1>
                  <p className="text-sm text-gray-500">{monthDisplay}</p>
                </div>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-600 text-white rounded-full px-5 py-2 flex items-center gap-2 shadow-md">
                    <Plus className="w-4 h-4" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Create New Monthly Goal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Goal Title *</Label>
                      <Input
                        id="title"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        placeholder="e.g., Launch Front-End v1"
                        className="border-gray-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="project">Project Name</Label>
                        <Input
                          id="project"
                          value={newGoal.project}
                          onChange={(e) => setNewGoal({ ...newGoal, project: e.target.value })}
                          placeholder="e.g., Bandana Platform"
                          className="border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={newGoal.status} onValueChange={(value: GoalStatus) => setNewGoal({ ...newGoal, status: value })}>
                          <SelectTrigger className="border-gray-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="on-track">On Track</SelectItem>
                            <SelectItem value="at-risk">At Risk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outcome">Sub-goal / Outcome</Label>
                      <Input
                        id="outcome"
                        value={newGoal.outcome}
                        onChange={(e) => setNewGoal({ ...newGoal, outcome: e.target.value })}
                        placeholder="e.g., Core Flows Live"
                        className="border-gray-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="kpi">KPI</Label>
                        <Input
                          id="kpi"
                          value={newGoal.kpi}
                          onChange={(e) => setNewGoal({ ...newGoal, kpi: e.target.value })}
                          placeholder="e.g., Holiday Promotion Campaign"
                          className="border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teamLeader">Team Leader</Label>
                        <Input
                          id="teamLeader"
                          value={newGoal.teamLeader}
                          onChange={(e) => setNewGoal({ ...newGoal, teamLeader: e.target.value })}
                          placeholder="e.g., Aditya Saw"
                          className="border-gray-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Deadline *</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newGoal.deadline}
                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        className="border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newGoal.notes}
                        onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
                        placeholder="Ship core user journeys first, defer edge cases..."
                        className="border-gray-200"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="risk">Risk</Label>
                      <Input
                        id="risk"
                        value={newGoal.risk}
                        onChange={(e) => setNewGoal({ ...newGoal, risk: e.target.value })}
                        placeholder="e.g., API dependency delay QA in last week"
                        className="border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="why">Why It Matters</Label>
                      <Textarea
                        id="why"
                        value={newGoal.why}
                        onChange={(e) => setNewGoal({ ...newGoal, why: e.target.value })}
                        placeholder="Explain the importance of this goal..."
                        className="border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resources">Strategy / Resources</Label>
                      <Textarea
                        id="resources"
                        value={newGoal.resources}
                        onChange={(e) => setNewGoal({ ...newGoal, resources: e.target.value })}
                        placeholder="List required resources or strategy breakdown..."
                        className="border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextSteps">Next Steps (one per line)</Label>
                      <Textarea
                        id="nextSteps"
                        value={newGoal.nextSteps}
                        onChange={(e) => setNewGoal({ ...newGoal, nextSteps: e.target.value })}
                        placeholder="- Finalize copy&#10;- Deploy new widgets&#10;- Send to dev"
                        rows={4}
                        className="border-gray-200"
                      />
                    </div>
                    <Button onClick={handleSubmit} className="w-full bg-green-500 hover:bg-green-600">
                      Create Goal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={viewMode === 'calendar' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </div>
          </div>

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="p-6">
              <MonthlyCalendarView 
                goals={goals}
                calendarDate={calendarDate}
                setCalendarDate={setCalendarDate}
                onGoalClick={setSelectedGoal}
              />
            </div>
          )}

          {/* Goals List */}
          {viewMode === 'list' && (
          <div className="p-6 space-y-4">
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No monthly goals yet. Add your first goal to get started!</p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-green-500 hover:bg-green-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Goal
                </Button>
              </div>
            ) : (
              goals.map((goal) => {
                const progress = getMonthlyGoalProgress(goal.id);
                const status = goal.status || 'in-progress';
                
                return (
                  <Card 
                    key={goal.id} 
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-white"
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <CardContent className="p-5">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGoalCompletion(goal.id, goal.completed);
                            }}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${getCheckboxStyle(status, goal.completed)}`}
                          >
                            {goal.completed && <CheckCircle className="w-4 h-4 text-white" />}
                          </button>
                          <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-medium ${getStatusTextColor(status)}`}>
                            {getStatusLabel(status)}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                          </Button>
                        </div>
                      </div>

                      {/* Sub-goal with checkmark */}
                      {goal.outcome && (
                        <div className="flex items-center gap-2 mb-3 ml-8">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">{goal.outcome}</span>
                          {progress > 0 && (
                            <span className="text-sm text-gray-500 ml-auto">Progress: {progress}%</span>
                          )}
                        </div>
                      )}

                      {/* Project & Status Row */}
                      <div className="flex items-center gap-6 ml-8">
                        {goal.project && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Project:</span>
                            <Select 
                              value={goal.project} 
                              onValueChange={(value) => onUpdateGoal?.(goal.id, { project: value })}
                            >
                              <SelectTrigger 
                                className="h-7 text-sm border-gray-200 bg-white w-auto min-w-[140px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={goal.project}>{goal.project}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Status:</span>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)}`}></div>
                            <span className="text-sm text-gray-700">{getStatusLabel(status)}</span>
                          </div>
                        </div>
                      </div>

                      {/* KPI Row */}
                      {goal.kpi && (
                        <div className="flex items-center gap-2 mt-3 ml-8">
                          <span className="text-sm text-gray-500">KPI:</span>
                          <span className="text-sm text-gray-700">{goal.kpi}</span>
                        </div>
                      )}

                      {/* Strategy Link */}
                      {goal.resources && (
                        <div className="flex items-center gap-2 mt-2 ml-8">
                          <span className="text-sm text-gray-500">Strategy:</span>
                          <button className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Strategy
                          </button>
                          <span className="text-xs text-gray-400">Breakdown</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          )}

          {/* Footer Summary */}
          {goals.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {goals.length} goal{goals.length !== 1 ? 's' : ''} set for {monthDisplay.split(' ')[0]}
                </span>
                <div className="flex items-center gap-4">
                  {statusCounts['in-progress'] > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                      <span className="text-sm text-gray-600">{statusCounts['in-progress']} In Progress</span>
                    </div>
                  )}
                  {statusCounts['on-track'] > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-600">{statusCounts['on-track']} On Track</span>
                    </div>
                  )}
                  {statusCounts['at-risk'] > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                      <span className="text-sm text-gray-600">{statusCounts['at-risk']} At Risk</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedGoal && (
          <div className="w-96 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 h-auto"
                  onClick={() => setSelectedGoal(null)}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Button>
                <span className="text-sm text-gray-600">Monthly Goals</span>
              </div>
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              {/* Title & Month */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{selectedGoal.title}</h2>
                <p className="text-sm text-gray-500">Month: {monthDisplay}</p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedGoal.status || 'in-progress')}`}></div>
                <span className={`font-medium ${getStatusTextColor(selectedGoal.status || 'in-progress')}`}>
                  {getStatusLabel(selectedGoal.status || 'in-progress')}
                </span>
              </div>

              {/* Project */}
              {selectedGoal.project && (
                <div>
                  <span className="text-sm text-gray-500">Project: </span>
                  <span className="text-sm font-medium text-gray-700">{selectedGoal.project}</span>
                </div>
              )}

              {/* Monthly Goal Status */}
              <div>
                <span className="text-sm text-gray-500">Monthly Goal: </span>
                <span className="text-sm font-medium text-gray-700">{getStatusLabel(selectedGoal.status || 'in-progress')}</span>
              </div>

              {/* Sub-goal / Outcome */}
              {selectedGoal.outcome && (
                <div className="text-gray-800 font-medium">
                  {selectedGoal.outcome}
                </div>
              )}

              {/* Team Leader */}
              {selectedGoal.teamLeader && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Team Leader:</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                        {selectedGoal.teamLeader.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">{selectedGoal.teamLeader}</span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedGoal.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Notes:</p>
                  <p className="text-sm text-gray-600">· {selectedGoal.notes}</p>
                </div>
              )}

              {/* Why it matters */}
              {selectedGoal.why && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Why it matters:</p>
                  <p className="text-sm text-gray-600">{selectedGoal.why}</p>
                </div>
              )}

              {/* Risk */}
              {selectedGoal.risk && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium text-gray-700">Risk: </span>
                    {selectedGoal.risk}
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-yellow-800">{selectedGoal.risk}</span>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {selectedGoal.nextSteps && selectedGoal.nextSteps.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Next Steps:</p>
                  <ul className="space-y-1">
                    {selectedGoal.nextSteps.map((step, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-gray-400">·</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Deadline */}
              {selectedGoal.deadline && (
                <div>
                  <span className="text-sm text-gray-500">Deadline: </span>
                  <span className="text-sm font-medium text-green-600">
                    {new Date(selectedGoal.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3">
              {onDeleteGoal && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-gray-600">
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{selectedGoal.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          onDeleteGoal(selectedGoal.id);
                          setSelectedGoal(null);
                        }} 
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white px-6"
                onClick={() => setSelectedGoal(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Monthly Calendar View Component
function MonthlyCalendarView({ 
  goals, 
  calendarDate,
  setCalendarDate,
  onGoalClick
}: { 
  goals: MonthlyGoal[];
  calendarDate: Date;
  setCalendarDate: (date: Date) => void;
  onGoalClick: (goal: MonthlyGoal) => void;
}) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  
  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Create calendar grid
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  // Get goals for a specific date
  const getGoalsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return goals.filter(g => g.deadline === dateStr);
  };
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const prevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };
  
  const today = new Date();
  const isToday = (day: number) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <div className="bg-white rounded-xl">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {monthNames[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCalendarDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dayGoals = day ? getGoalsForDate(day) : [];
          return (
            <div
              key={idx}
              className={`min-h-24 p-2 border border-gray-100 rounded-lg ${
                day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50'
              } ${isToday(day || 0) ? 'ring-2 ring-green-500 ring-inset' : ''}`}
            >
              {day && (
                <>
                  <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-green-600' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayGoals.slice(0, 3).map(goal => (
                      <div
                        key={goal.id}
                        onClick={() => onGoalClick(goal)}
                        className={`text-xs p-1 rounded cursor-pointer truncate ${
                          goal.status === 'on-track' ? 'bg-green-100 text-green-700' :
                          goal.status === 'at-risk' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {goal.title}
                      </div>
                    ))}
                    {dayGoals.length > 3 && (
                      <div className="text-xs text-gray-500">+{dayGoals.length - 3} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span className="text-sm text-gray-600">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-sm text-gray-600">On Track</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-sm text-gray-600">At Risk</span>
        </div>
      </div>
    </div>
  );
}