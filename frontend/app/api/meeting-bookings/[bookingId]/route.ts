import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../utils/supabaseServer';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const body = await request.json();
    const { status, teacher_response, teacher_id } = body; // Get teacher_id from request body

    // Validate status
    if (!['approved', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be approved or declined' }, { status: 400 });
    }

    // Get the booking and verify teacher authorization
    const { data: booking, error: bookingError } = await supabaseServer
      .from('meeting_bookings')
      .select(`
        *,
        teachers!inner(id),
        clubs(name)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Meeting booking not found' }, { status: 404 });
    }

    // Check if the provided teacher_id matches the booking's teacher
    if (!teacher_id || booking.teacher_id !== teacher_id) {
      return NextResponse.json({ error: 'Unauthorized to modify this booking' }, { status: 403 });
    }

    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      return NextResponse.json({ error: 'Booking is no longer pending' }, { status: 400 });
    }

    // Update the booking status
    const { data: updatedBooking, error: updateError } = await supabaseServer
      .from('meeting_bookings')
      .update({
        status,
        teacher_response,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select(`
        *,
        clubs(name),
        teachers(name, email)
      `)
      .single();

    if (updateError) {
      console.error('Error updating meeting booking:', updateError);
      return NextResponse.json({ error: 'Failed to update meeting booking' }, { status: 500 });
    }

    // Create notification for student
    const notificationTitle = status === 'approved' ? 'Meeting Request Approved' : 'Meeting Request Declined';
    const notificationMessage = status === 'approved' 
      ? `Your meeting request for ${booking.meeting_date} has been approved${teacher_response ? `: ${teacher_response}` : ''}`
      : `Your meeting request for ${booking.meeting_date} has been declined${teacher_response ? `: ${teacher_response}` : ''}`;

    await supabaseServer
      .from('notifications')
      .insert({
        user_id: booking.student_id,
        type: status === 'approved' ? 'meeting_approved' : 'meeting_declined',
        title: notificationTitle,
        message: notificationMessage,
        related_id: bookingId
      });

    return NextResponse.json({
      message: `Meeting booking ${status} successfully`,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error in meeting booking PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await params;

    // Get the booking and verify authorization
    const { data: booking, error: bookingError } = await supabaseServer
      .from('meeting_bookings')
      .select(`
        *,
        teachers!inner(user_id)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Meeting booking not found' }, { status: 404 });
    }

    // Check if the authenticated user is either the student or the teacher
    const isStudent = booking.student_id === userId;
    const isTeacher = booking.teachers.user_id === userId;

    if (!isStudent && !isTeacher) {
      return NextResponse.json({ error: 'Unauthorized to delete this booking' }, { status: 403 });
    }

    // Update status to cancelled instead of deleting
    const { error: updateError } = await supabaseServer
      .from('meeting_bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error cancelling meeting booking:', updateError);
      return NextResponse.json({ error: 'Failed to cancel meeting booking' }, { status: 500 });
    }

    // Create notification for the other party
    const notificationUserId = isStudent ? booking.teachers.user_id : booking.student_id;
    const notificationTitle = 'Meeting Cancelled';
    const notificationMessage = `Meeting for ${booking.meeting_date} has been cancelled`;

    await supabaseServer
      .from('notifications')
      .insert({
        user_id: notificationUserId,
        type: 'meeting_cancelled',
        title: notificationTitle,
        message: notificationMessage,
        related_id: bookingId
      });

    return NextResponse.json({ message: 'Meeting booking cancelled successfully' });
  } catch (error) {
    console.error('Error in meeting booking DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}