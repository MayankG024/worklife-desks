import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';

interface LoginPageProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

export default function LoginPage({ onLogin, onSwitchToSignup, onForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onLogin(email, password, rememberMe);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8">
      {/* Logo */}
      <div className="px-6 py-3 border-2 border-primary rounded-lg mb-8">
        <h2 className="text-sm tracking-widest text-primary font-normal">WORK LIFE DESKS</h2>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md px-8">
        <h1 className="text-3xl font-semibold text-center mb-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Existing User? Login.
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your Password"
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-gray-600 cursor-pointer"
              >
                Remember Me?
              </label>
            </div>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-gray-600 hover:text-primary hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
            <Button type="submit" className="w-48 bg-primary hover:bg-primary/90">
              Login
            </Button>
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-sm text-gray-600 hover:text-primary hover:underline"
            >
              New Here? Signup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
