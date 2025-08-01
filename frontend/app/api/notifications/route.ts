import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import { Notification } from '../../../types/teacher';

// GET /api/notifications - List notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const read = searchParams.get('read');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id);

    // Apply filters
    if (read !== null) {
      query = query.eq('read', read === 'true');
    }

    if (type) {
      query = query.eq('type', type);
    }

    // Get total count for unread notifications
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('read', false);

    // Get notifications with pagination
    const { data: notifications, error } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      notifications: notifications || [],
      total: notifications?.length || 0,
      unread_count: unreadCount || 0
    });

  } catch (error) {
    console.error('Error in notifications GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, type, title, message, related_id } = body;

    // Validate required fields
    if (!user_id || !type || !title || !message) {
      return NextResponse.json(
        { error: 'user_id, type, title, and message are required' },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes = [
      'advisor_request',
      'booking_confirmed',
      'booking_cancelled',
      'availability_updated',
      'request_approved',
      'request_denied'
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // Create notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([{
        user_id,
        type,
        title,
        message,
        related_id,
        read: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    return NextResponse.json(notification, { status: 201 });

  } catch (error) {
    console.error('Error in notifications POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notification_ids, user_id, mark_all_read } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    let updateQuery;

    if (mark_all_read) {
      // Mark all notifications as read for the user
      updateQuery = supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user_id)
        .eq('read', false);
    } else if (notification_ids && Array.isArray(notification_ids)) {
      // Mark specific notifications as read
      updateQuery = supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user_id)
        .in('id', notification_ids);
    } else {
      return NextResponse.json(
        { error: 'Either notification_ids array or mark_all_read flag is required' },
        { status: 400 }
      );
    }

    const { error } = await updateQuery;

    if (error) {
      console.error('Error updating notifications:', error);
      return NextResponse.json(
        { error: 'Failed to update notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Notifications marked as read successfully' 
    });

  } catch (error) {
    console.error('Error in notifications PATCH:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notification_id = searchParams.get('notification_id');
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    let deleteQuery;

    if (notification_id) {
      // Delete specific notification
      deleteQuery = supabase
        .from('notifications')
        .delete()
        .eq('id', notification_id)
        .eq('user_id', user_id);
    } else {
      // Delete all read notifications for the user
      deleteQuery = supabase
        .from('notifications')
        .delete()
        .eq('user_id', user_id)
        .eq('read', true);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Error deleting notifications:', error);
      return NextResponse.json(
        { error: 'Failed to delete notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Notifications deleted successfully' 
    });

  } catch (error) {
    console.error('Error in notifications DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 