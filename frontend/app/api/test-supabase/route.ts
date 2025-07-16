import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../utils/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase connection...');
    console.log('Environment variables:', {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
    });

    // Test a simple query
    const { data, error } = await supabaseServer
      .from('roadmaps')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase test error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection successful',
      data 
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 