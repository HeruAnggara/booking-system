import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const AuthPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Additional gradient overlays for better coverage */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/50"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-50/30 via-transparent to-pink-50/30"></div>
      </div>

      {/* Floating Music Notes */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-blue-300/40 text-4xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>♪</div>
        <div className="absolute top-1/3 right-1/4 text-purple-300/40 text-3xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>♫</div>
        <div className="absolute bottom-1/3 left-1/3 text-pink-300/40 text-5xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}>♪</div>
        <div className="absolute bottom-1/4 right-1/3 text-indigo-300/40 text-3xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>♫</div>
        <div className="absolute top-1/2 left-1/6 text-blue-400/30 text-2xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }}>♪</div>
        <div className="absolute top-3/4 right-1/6 text-purple-400/30 text-4xl animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '3.8s' }}>♫</div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <div className="transform transition-all duration-500 ease-in-out hover:scale-[1.02]">
            {isLoginMode ? (
              <LoginForm onToggleMode={() => setIsLoginMode(false)} />
            ) : (
              <RegisterForm onToggleMode={() => setIsLoginMode(true)} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20 fill-white/20">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>

      {/* Top Decorative Elements */}
      <div className="absolute top-0 left-0 right-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-white/10 rotate-180">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".15"></path>
        </svg>
      </div>
    </div>
  );
};