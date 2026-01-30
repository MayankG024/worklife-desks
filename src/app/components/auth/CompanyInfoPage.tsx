import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface CompanyInfoPageProps {
  onContinue: (data: CompanyData) => void;
}

export interface CompanyData {
  companyName: string;
  natureOfWork: string;
  numberOfEmployees: string;
}

const natureOfWorkOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Marketing',
  'Real Estate',
  'Other'
];

const employeeCountOptions = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
];

export default function CompanyInfoPage({ onContinue }: CompanyInfoPageProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    natureOfWork: '',
    numberOfEmployees: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.natureOfWork) newErrors.natureOfWork = 'Please select nature of work';
    if (!formData.numberOfEmployees) newErrors.numberOfEmployees = 'Please select number of employees';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onContinue(formData);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8">
      {/* Logo */}
      <div className="px-6 py-3 border-2 border-primary rounded-lg mb-8">
        <h2 className="text-sm tracking-widest text-primary font-normal">WORK LIFE DESKS</h2>
      </div>

      {/* Company Info Form */}
      <div className="w-full max-w-md px-8">
        <h1 className="text-3xl font-semibold text-center mb-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Company's Information
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Name of the Company</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Enter the Name"
              className={errors.companyName ? 'border-red-500' : ''}
            />
            {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="natureOfWork">Nature of Work</Label>
            <Select
              value={formData.natureOfWork}
              onValueChange={(value) => setFormData({ ...formData, natureOfWork: value })}
            >
              <SelectTrigger className={errors.natureOfWork ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {natureOfWorkOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.natureOfWork && <p className="text-xs text-red-500">{errors.natureOfWork}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfEmployees">Number of Employees</Label>
            <Select
              value={formData.numberOfEmployees}
              onValueChange={(value) => setFormData({ ...formData, numberOfEmployees: value })}
            >
              <SelectTrigger className={errors.numberOfEmployees ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {employeeCountOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.numberOfEmployees && <p className="text-xs text-red-500">{errors.numberOfEmployees}</p>}
          </div>

          <div className="flex flex-col items-center pt-6">
            <Button type="submit" className="w-48 bg-primary hover:bg-primary/90">
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
