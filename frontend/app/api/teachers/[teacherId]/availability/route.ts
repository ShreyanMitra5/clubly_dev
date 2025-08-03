import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../utils/supabaseServer';

export async function POST(
  req: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  try {
    const teacherId = params.teacherId;
    const body: {
      slots: Array<{ day: number; start: string; end: string }>;
      room: string;
    } = await req.json();

    console.log('Saving availability for teacher:', teacherId);
    console.log('Slots:', body.slots);
    console.log('Room:', body.room);

    // First, delete existing availability for this teacher
    const { error: deleteError } = await supabase
      .from('teacher_availability')
      .delete()
      .eq('teacher_id', teacherId);

    if (deleteError) {
      console.error('Error deleting existing availability:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Create new availability rows
    const rows = body.slots.map(slot => ({
      teacher_id: teacherId,
      day_of_week: slot.day,          // 0–6 Sun–Sat
      start_time: slot.start,         // '14:00:00'
      end_time: slot.end,             // '15:00:00'
      room_number: body.room,
      is_recurring: true,
      is_active: true
    }));

    console.log('Inserting rows:', rows);

    // Insert new availability
    const { error: insertError } = await supabase
      .from('teacher_availability')
      .insert(rows);

    if (insertError) {
      console.error('Error inserting availability:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log('Successfully saved teacher availability');
    return NextResponse.json({ success: true, count: rows.length });

  } catch (error: any) {
    console.error('Error in availability API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  try {
    const teacherId = params.teacherId;

    const { data, error } = await supabase
      .from('teacher_availability')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching availability:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ availability: data });

  } catch (error: any) {
    console.error('Error in availability GET API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}