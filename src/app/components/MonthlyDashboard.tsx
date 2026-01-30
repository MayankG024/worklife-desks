import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/components/ui/alert-dialog';
import { Label } from '@/app/components/ui/label';
import { Progress } from '@/app/components/ui/progress';
import { Plus, Calendar, X, Check, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

interface WorkflowAudit {
  whatsWorking: string[];
  whatsNot: string[];
  fixThisNext: string[];
}

interface Metric {
  id: string;
  name: string;
  target: string;
  actual: string;
}

export interface MonthlyGoal {
  id: string;
  title: string;
  why: string;
  resources: string;
  deadline: string;
  outcome: string;
  nextSteps: string[];
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
  currentMonth: string;
  weeklyGoalsProgress?: WeeklyGoalProgress[];
}

export default function MonthlyDashboard({ goals, onAddGoal, onDeleteGoal, currentMonth, weeklyGoalsProgress = [] }: MonthlyDashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    why: '',
    resources: '',
    deadline: '',
    outcome: '',
    nextSteps: ''
  });

  // Calculate monthly goal progress based on linked weekly goals
  const getMonthlyGoalProgress = (goalId: string): number => {
    const linkedWeeklyGoals = weeklyGoalsProgress.filter(wg => wg.monthlyGoalId === goalId);
    if (linkedWeeklyGoals.length === 0) return 0;
    const totalProgress = linkedWeeklyGoals.reduce((sum, wg) => sum + wg.progress, 0);
    return Math.round(totalProgress / linkedWeeklyGoals.length);
  };

  // Monthly objective state
  const [monthlyObjective, setMonthlyObjective] = useState('Streamline workflows + focus on high-deliverables');
  const [isEditingObjective, setIsEditingObjective] = useState(false);

  // Load monthly objective from localStorage
  useEffect(() => {
    const savedObjective = localStorage.getItem('monthlyObjective');
    if (savedObjective) {
      setMonthlyObjective(savedObjective);
    }
  }, []);

  // Save monthly objective to localStorage
  useEffect(() => {
    localStorage.setItem('monthlyObjective', monthlyObjective);
  }, [monthlyObjective]);

  // Workflow audit state
  const [workflowAudit, setWorkflowAudit] = useState<WorkflowAudit>({
    whatsWorking: ['Weekly planning routine', 'Clear project data goals', 'Consistent posting schedule'],
    whatsNot: ['Too status manual tasks', 'Pinterest consistency'],
    fixThisNext: ['Mass posting to scheduler', 'Batch all-loop writing']
  });
  const [editingField, setEditingField] = useState<keyof WorkflowAudit | null>(null);
  const [newItem, setNewItem] = useState('');

  // Key metrics state
  const [metrics, setMetrics] = useState<Metric[]>([
    { id: '1', name: 'CTA views', target: '300', actual: '-' },
    { id: '2', name: 'CTA visits', target: '120', actual: '-' },
    { id: '3', name: 'Pinterest referral', target: '80', actual: '-' },
    { id: '4', name: 'Schedule automation', target: '5*', actual: '-' },
    { id: '5', name: 'Products published', target: '4', actual: '-' }
  ]);
  const [editingMetric, setEditingMetric] = useState<{ id: string; field: 'target' | 'actual' } | null>(null);

  // Load workflow audit from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('workflowAudit');
    if (saved) {
      setWorkflowAudit(JSON.parse(saved));
    }
  }, []);

  // Load metrics from localStorage
  useEffect(() => {
    const savedMetrics = localStorage.getItem('keyMetrics');
    if (savedMetrics) {
      setMetrics(JSON.parse(savedMetrics));
    }
  }, []);

  // Save workflow audit to localStorage
  useEffect(() => {
    localStorage.setItem('workflowAudit', JSON.stringify(workflowAudit));
  }, [workflowAudit]);

  // Save metrics to localStorage
  useEffect(() => {
    localStorage.setItem('keyMetrics', JSON.stringify(metrics));
  }, [metrics]);

  const updateMetric = (id: string, field: 'target' | 'actual', value: string) => {
    setMetrics(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addAuditItem = (field: keyof WorkflowAudit) => {
    if (newItem.trim()) {
      setWorkflowAudit(prev => ({
        ...prev,
        [field]: [...prev[field], newItem.trim()]
      }));
      setNewItem('');
      setEditingField(null);
    }
  };

  const removeAuditItem = (field: keyof WorkflowAudit, index: number) => {
    setWorkflowAudit(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
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
        nextSteps: ''
      });
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="tracking-wide mb-3 text-black font-semibold" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '2.4rem' }}>MONTHLY DASHBOARD</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <p className="text-sm">M/Y: {currentMonth}</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Monthly Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title *</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Launch updated website"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="why">Why It Matters</Label>
                <Textarea
                  id="why"
                  value={newGoal.why}
                  onChange={(e) => setNewGoal({ ...newGoal, why: e.target.value })}
                  placeholder="Explain the importance of this goal..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resources">Required Resources</Label>
                <Textarea
                  id="resources"
                  value={newGoal.resources}
                  onChange={(e) => setNewGoal({ ...newGoal, resources: e.target.value })}
                  placeholder="List required resources..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Textarea
                  id="outcome"
                  value={newGoal.outcome}
                  onChange={(e) => setNewGoal({ ...newGoal, outcome: e.target.value })}
                  placeholder="Describe expected outcome..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextSteps">Next Steps (one per line)</Label>
                <Textarea
                  id="nextSteps"
                  value={newGoal.nextSteps}
                  onChange={(e) => setNewGoal({ ...newGoal, nextSteps: e.target.value })}
                  placeholder="- Finalize copy&#10;- Deploy new widgets&#10;- Send to dev"
                  rows={5}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 p-4 bg-accent border-2 border-primary rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-black uppercase tracking-wide">MONTHLY OBJECTIVE:</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsEditingObjective(!isEditingObjective)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
        {isEditingObjective ? (
          <div className="flex gap-2">
            <Input
              value={monthlyObjective}
              onChange={(e) => setMonthlyObjective(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingObjective(false)}
            />
            <Button size="sm" onClick={() => setIsEditingObjective(false)}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <p className="text-gray-700">{monthlyObjective}</p>
        )}
      </div>

      {goals.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No monthly goals yet. Add your first goal to get started!</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Goal
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map((goal, index) => {
            const progress = getMonthlyGoalProgress(goal.id);
            return (
            <Card key={goal.id} className="border-2">
              <CardHeader className="bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Goal {index + 1}:</span>
                      <span>{goal.title}</span>
                      {progress === 100 && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </CardTitle>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Progress</span>
                        <span className={progress === 100 ? 'text-green-600 font-semibold' : ''}>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                  {onDeleteGoal && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 ml-2">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{goal.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteGoal(goal.id)} className="bg-red-500 hover:bg-red-600">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {goal.why && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Why it matters:</p>
                    <p className="text-sm text-gray-700">{goal.why}</p>
                  </div>
                )}
                {goal.resources && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Required resources:</p>
                    <p className="text-sm text-gray-700">{goal.resources}</p>
                  </div>
                )}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Project Name: <span className="text-blue-600">{goal.title}</span></p>
                  {goal.outcome && (
                    <p className="text-sm mb-2">
                      <span className="font-semibold text-gray-600">Outcome: </span>
                      <span className="text-gray-700">{goal.outcome}</span>
                    </p>
                  )}
                  <p className="text-sm mb-2">
                    <span className="font-semibold text-gray-600">Deadline: </span>
                    <span className="text-purple-600">{new Date(goal.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                  </p>
                  {goal.nextSteps.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Next Steps:</p>
                      <ul className="text-sm space-y-1">
                        {goal.nextSteps.map((step, idx) => (
                          <li key={idx} className="text-gray-700">- {step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics for This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-sm font-semibold text-gray-600 border-b pb-2">
                <div>Metric</div>
                <div>Target</div>
                <div>Actual</div>
              </div>
              {metrics.map((metric, index) => (
                <div key={metric.id} className={`grid grid-cols-3 gap-2 text-sm py-2 ${index < metrics.length - 1 ? 'border-b' : ''}`}>
                  <div>{metric.name}</div>
                  <div>
                    {editingMetric?.id === metric.id && editingMetric.field === 'target' ? (
                      <Input
                        value={metric.target}
                        onChange={(e) => updateMetric(metric.id, 'target', e.target.value)}
                        onBlur={() => setEditingMetric(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingMetric(null)}
                        className="h-6 w-16 text-sm p-1"
                        autoFocus
                      />
                    ) : (
                      <span
                        className="cursor-pointer hover:bg-gray-100 px-1 rounded"
                        onClick={() => setEditingMetric({ id: metric.id, field: 'target' })}
                      >
                        {metric.target}
                      </span>
                    )}
                  </div>
                  <div>
                    {editingMetric?.id === metric.id && editingMetric.field === 'actual' ? (
                      <Input
                        value={metric.actual}
                        onChange={(e) => updateMetric(metric.id, 'actual', e.target.value)}
                        onBlur={() => setEditingMetric(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingMetric(null)}
                        className="h-6 w-16 text-sm p-1"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`cursor-pointer hover:bg-gray-100 px-1 rounded ${metric.actual === '-' ? 'text-gray-400' : ''}`}
                        onClick={() => setEditingMetric({ id: metric.id, field: 'actual' })}
                      >
                        {metric.actual}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Systems & Workflows Audit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* What's Working */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-600">What's working</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setEditingField(editingField === 'whatsWorking' ? null : 'whatsWorking')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {editingField === 'whatsWorking' && (
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add new item..."
                    className="h-8 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && addAuditItem('whatsWorking')}
                  />
                  <Button size="sm" className="h-8" onClick={() => addAuditItem('whatsWorking')}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <ul className="text-sm text-gray-700 space-y-1">
                {workflowAudit.whatsWorking.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between group">
                    <span>- {item}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAuditItem('whatsWorking', idx)}
                    >
                      <X className="h-3 w-3 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* What's Not */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-600">What's not</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setEditingField(editingField === 'whatsNot' ? null : 'whatsNot')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {editingField === 'whatsNot' && (
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add new item..."
                    className="h-8 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && addAuditItem('whatsNot')}
                  />
                  <Button size="sm" className="h-8" onClick={() => addAuditItem('whatsNot')}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <ul className="text-sm text-gray-700 space-y-1">
                {workflowAudit.whatsNot.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between group">
                    <span>- {item}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAuditItem('whatsNot', idx)}
                    >
                      <X className="h-3 w-3 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fix This Next */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-600">Fix This Next</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setEditingField(editingField === 'fixThisNext' ? null : 'fixThisNext')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {editingField === 'fixThisNext' && (
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add new item..."
                    className="h-8 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && addAuditItem('fixThisNext')}
                  />
                  <Button size="sm" className="h-8" onClick={() => addAuditItem('fixThisNext')}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <ul className="text-sm text-gray-700 space-y-1">
                {workflowAudit.fixThisNext.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between group">
                    <span>- {item}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAuditItem('fixThisNext', idx)}
                    >
                      <X className="h-3 w-3 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}