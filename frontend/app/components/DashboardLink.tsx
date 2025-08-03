'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

interface DashboardLinkProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function DashboardLink({ className, children, onClick }: DashboardLinkProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTeacherStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: teacherData, error } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking teacher status:', error);
          setIsTeacher(false);
        } else {
          setIsTeacher(!!teacherData);
        }
      } catch (err) {
        console.error('Error in teacher check:', err);
        setIsTeacher(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkTeacherStatus();
  }, [user]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (onClick) onClick();
    
    if (isLoading) {
      // Still loading, don't navigate yet
      return;
    }
    
    if (isTeacher) {
      router.push('/teacher-dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={className}
      disabled={isLoading}
    >
      {children}
    </button>
  );
}