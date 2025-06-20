import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Mail, Lock, User, Eye, EyeOff, Music, Sparkles, UserPlus } from 'lucide-react';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(email, password, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo and Brand Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-2xl mb-4 shadow-lg">
          <Music className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          ConcertBook
        </h1>
        <p className="text-gray-500 mt-2">Join thousands of music lovers</p>
      </div>

      <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <UserPlus className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            <Sparkles className="h-5 w-5 text-blue-500" />
          </div>
          <CardDescription className="text-center text-gray-600">
            Start your journey to amazing live music experiences
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Full Name
              </Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="pl-12 pr-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                Confirm Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:from-blue-700 hover:via-purple-700 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Create My Account</span>
                </div>
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={onToggleMode}
              className="w-full h-12 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700 font-semibold rounded-xl transition-all duration-200"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <Music className="h-4 w-4" />
                <span>Sign In Instead</span>
              </div>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>By creating an account, you agree to our Terms & Privacy Policy</p>
        <div className="flex items-center justify-center space-x-4 mt-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>SSL Protected</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Data Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};