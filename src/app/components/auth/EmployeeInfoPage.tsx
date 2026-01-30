import { useState, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Plus, X } from 'lucide-react';

interface EmployeeInfoPageProps {
  onContinue: (employees: Employee[]) => void;
}

export interface Employee {
  id: string;
  name: string;
  title: string;
  phoneNumber: string;
  email: string;
}

const createEmptyEmployee = (): Employee => ({
  id: Math.random().toString(36).substr(2, 9),
  name: '',
  title: '',
  phoneNumber: '',
  email: ''
});

export default function EmployeeInfoPage({ onContinue }: EmployeeInfoPageProps) {
  const [employees, setEmployees] = useState<Employee[]>([
    createEmptyEmployee(),
    createEmptyEmployee(),
    createEmptyEmployee(),
    createEmptyEmployee()
  ]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvEmployees, setCsvEmployees] = useState<Employee[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEmployeeChange = (id: string, field: keyof Employee, value: string) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
  };

  const addEmployee = () => {
    setEmployees([...employees, createEmptyEmployee()]);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      
      // Parse CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const parsedEmployees: Employee[] = [];
        
        // Skip header row if it exists
        const startIndex = lines[0]?.toLowerCase().includes('name') ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 1) {
            parsedEmployees.push({
              id: Math.random().toString(36).substr(2, 9),
              name: values[0] || '',
              title: values[1] || '',
              phoneNumber: values[2] || '',
              email: values[3] || ''
            });
          }
        }
        
        setCsvEmployees(parsedEmployees);
      };
      reader.readAsText(file);
    }
  };

  const handleRemoveCsv = () => {
    setCsvFile(null);
    setCsvEmployees([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContinue = () => {
    if (csvFile && csvEmployees.length > 0) {
      onContinue(csvEmployees);
    } else {
      // Filter out empty employees
      const validEmployees = employees.filter(emp => 
        emp.name.trim() || emp.title.trim() || emp.email.trim()
      );
      onContinue(validEmployees);
    }
  };

  // CSV Upload View
  if (csvFile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center pt-8">
        {/* Logo */}
        <div className="px-6 py-3 border-2 border-primary rounded-lg mb-8">
          <h2 className="text-sm tracking-widest text-primary font-normal">WORK LIFE DESKS</h2>
        </div>

        {/* Employee Info Form */}
        <div className="w-full max-w-md px-8">
          <h1 className="text-3xl font-semibold text-center mb-12" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Employee's Information
          </h1>

          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-600 mb-3">CSV Sheet Uploaded</p>
            <div className="flex items-center gap-2 border rounded-lg px-4 py-2 bg-gray-50">
              <span className="text-sm text-gray-700">{csvFile.name}</span>
              <button 
                onClick={handleRemoveCsv}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {csvEmployees.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {csvEmployees.length} employee(s) found
              </p>
            )}
          </div>

          <div className="flex justify-center gap-4 mt-12">
            <Button onClick={handleContinue} className="w-32 bg-primary hover:bg-primary/90">
              Continue
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRemoveCsv}
              className="w-32"
            >
              Change
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Manual Entry View
  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8">
      {/* Logo */}
      <div className="px-6 py-3 border-2 border-primary rounded-lg mb-8">
        <h2 className="text-sm tracking-widest text-primary font-normal">WORK LIFE DESKS</h2>
      </div>

      {/* Employee Info Form */}
      <div className="w-full max-w-5xl px-8">
        <h1 className="text-3xl font-semibold text-center mb-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Employee's Information
        </h1>

        {/* Header Labels */}
        <div className="grid grid-cols-4 gap-4 mb-2">
          <Label className="text-sm text-gray-600">Name of the Employee</Label>
          <Label className="text-sm text-gray-600">Enter Employee's Title</Label>
          <Label className="text-sm text-gray-600">Enter Phone Number</Label>
          <Label className="text-sm text-gray-600">Enter Email ID</Label>
        </div>

        {/* Employee Rows */}
        <div className="space-y-3">
          {employees.map((employee) => (
            <div key={employee.id} className="grid grid-cols-4 gap-4">
              <Input
                value={employee.name}
                onChange={(e) => handleEmployeeChange(employee.id, 'name', e.target.value)}
                placeholder="Enter the Name"
              />
              <Input
                value={employee.title}
                onChange={(e) => handleEmployeeChange(employee.id, 'title', e.target.value)}
                placeholder="Enter the Title"
              />
              <Input
                value={employee.phoneNumber}
                onChange={(e) => handleEmployeeChange(employee.id, 'phoneNumber', e.target.value)}
                placeholder="Enter the Number"
              />
              <Input
                value={employee.email}
                onChange={(e) => handleEmployeeChange(employee.id, 'email', e.target.value)}
                placeholder="Enter Email ID"
                type="email"
              />
            </div>
          ))}
        </div>

        {/* Add New Employee Button */}
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={addEmployee}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Employee
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button onClick={handleContinue} className="w-32 bg-primary hover:bg-primary/90">
            Continue
          </Button>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
