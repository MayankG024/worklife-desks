import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { ArrowLeft, Save, User, Building, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  company?: {
    companyName: string;
    natureOfWork: string;
    numberOfEmployees: string;
  };
  workMode: string;
  currentMode: string;
  loginTime: string;
  logoutTime: string;
  currentlyWorkingOn: string;
}

interface ProfilePageProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    company?: {
      companyName: string;
      natureOfWork: string;
      numberOfEmployees: string;
    };
  };
  onBack: () => void;
  onSave: (data: ProfileData) => void;
}

export default function ProfilePage({ userData, onBack, onSave }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    email: userData.email || '',
    company: userData.company,
    workMode: 'Work From Home',
    currentMode: 'Focused Task',
    loginTime: '10 AM',
    logoutTime: '5 PM',
    currentlyWorkingOn: "I'm Currently working on Tyoharz Listing"
  });

  // Load saved profile data
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedOnlineStatus = localStorage.getItem('userOnlineStatus');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(prev => ({ ...prev, ...parsed }));
    }
    if (savedOnlineStatus !== null) {
      setIsOnline(savedOnlineStatus === 'true');
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    onSave(profile);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="border-2 border-primary rounded-full px-4 py-1">
              <span className="font-semibold text-sm tracking-wide">WORK LIFE DESKS</span>
            </div>
            <div className="w-32" /> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-center tracking-wide">
            WELCOME {profile.firstName.toUpperCase()} {profile.lastName.toUpperCase()}
          </h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="border-2 border-primary border-dashed">
          <CardContent className="p-6">
            <div className="flex gap-8">
              {/* Left Side - Avatar and Status */}
              <div className="w-48 flex flex-col items-center">
                {/* Avatar */}
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200 mb-4">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                {/* Online Status Toggle */}
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                  <button
                    onClick={() => {
                      const newStatus = !isOnline;
                      setIsOnline(newStatus);
                      localStorage.setItem('userOnlineStatus', String(newStatus));
                      toast.success(newStatus ? 'You are now online' : 'You are now offline');
                    }}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      isOnline ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>
              </div>

              {/* Right Side - Form Fields */}
              <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4">
                {/* Work Mode */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Work Mode</Label>
                  {isEditing ? (
                    <Select value={profile.workMode} onValueChange={(v) => handleChange('workMode', v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Work From Home">Work From Home</SelectItem>
                        <SelectItem value="Work From Office">Work From Office</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm py-2 border-b">{profile.workMode}</p>
                  )}
                </div>

                {/* Login Time */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Login Time</Label>
                  {isEditing ? (
                    <Input 
                      value={profile.loginTime}
                      onChange={(e) => handleChange('loginTime', e.target.value)}
                      className="h-9"
                    />
                  ) : (
                    <p className="text-sm py-2 border-b">{profile.loginTime}</p>
                  )}
                </div>

                {/* Current Mode */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Current Mode</Label>
                  {isEditing ? (
                    <Select value={profile.currentMode} onValueChange={(v) => handleChange('currentMode', v)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Focused Task">Focused Task</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="In a Meeting">In a Meeting</SelectItem>
                        <SelectItem value="Lunch Break">Lunch Break</SelectItem>
                        <SelectItem value="Away from Desk">Away from Desk</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm py-2 border-b">{profile.currentMode}</p>
                  )}
                </div>

                {/* Logout Time */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Logout Time</Label>
                  {isEditing ? (
                    <Input 
                      value={profile.logoutTime}
                      onChange={(e) => handleChange('logoutTime', e.target.value)}
                      className="h-9"
                    />
                  ) : (
                    <p className="text-sm py-2 border-b">{profile.logoutTime}</p>
                  )}
                </div>

                {/* Currently Working On - Full Width */}
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs text-gray-500">Currently Working On</Label>
                  {isEditing ? (
                    <Textarea 
                      value={profile.currentlyWorkingOn}
                      onChange={(e) => handleChange('currentlyWorkingOn', e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                  ) : (
                    <p className="text-sm py-2 border-b">{profile.currentlyWorkingOn}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center mt-8">
              {isEditing ? (
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    className="bg-primary hover:bg-primary/90 px-8"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-primary hover:bg-primary/90 px-12"
                >
                  Update
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Profile Info */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          {/* Personal Info Card */}
          <Card className="border">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Full Name</Label>
                  <p className="text-sm">{profile.firstName} {profile.lastName}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Email</Label>
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    {profile.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Info Card */}
          {profile.company && (
            <Card className="border">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Company Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">Company Name</Label>
                    <p className="text-sm">{profile.company.companyName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Industry</Label>
                    <p className="text-sm">{profile.company.natureOfWork}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Company Size</Label>
                    <p className="text-sm">{profile.company.numberOfEmployees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
