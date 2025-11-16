const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Fetch today's schedule
export async function getTodaySchedule(facultyId) {
  try {
    const res = await fetch(`${API_BASE_URL}/scheduling/scheduledevent/today/?faculty_id=${facultyId}`);
    if (!res.ok) throw new Error('Failed to fetch today schedule');
    return await res.json();
  } catch (error) {
    console.error('Error fetching today schedule:', error);
    throw error;
  }
}

// Fetch upcoming events
export async function getUpcomingEvents(facultyId) {
  try {
    const res = await fetch(`${API_BASE_URL}/scheduling/scheduledevent/upcoming/?faculty_id=${facultyId}`);
    if (!res.ok) throw new Error('Failed to fetch upcoming events');
    return await res.json();
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
}

// Fetch notifications
export async function getNotifications(recipientId) {
  try {
    const res = await fetch(`${API_BASE_URL}/scheduling/notification/for_recipient/?recipient_id=${recipientId}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return await res.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

// Fetch all classes
export async function getClasses() {
  try {
    const res = await fetch(`${API_BASE_URL}/scheduling/classes/`);
    if (!res.ok) throw new Error('Failed to fetch classes');
    return await res.json();
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
}

// Fetch all subjects
export async function getSubjects() {
  try {
    const res = await fetch(`${API_BASE_URL}/scheduling/subjects/`);
    if (!res.ok) throw new Error('Failed to fetch subjects');
    return await res.json();
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
}

// Fetch faculty assignments
export async function getFacultyAssignments(facultyId) {
  try {
    const res = await fetch(`${API_BASE_URL}/scheduling/assign/?faculty_id=${facultyId}`);
    if (!res.ok) throw new Error('Failed to fetch assignments');
    return await res.json();
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
}

// Fetch timetable for a class
export async function getTimetableByClass(classId) {
  try {
    const res = await fetch(`${API_BASE_URL}/scheduling/timetable/by_class/?class_id=${classId}`);
    if (!res.ok) throw new Error('Failed to fetch timetable');
    return await res.json();
  } catch (error) {
    console.error('Error fetching timetable:', error);
    throw error;
  }
}

// Fetch slot booking requests
export async function getSlotRequests(facultyId) {
  try {
    const res = await fetch(`${API_BASE_URL}/scheduling/slotrequest/by_faculty/?faculty_id=${facultyId}`);
    if (!res.ok) throw new Error('Failed to fetch slot requests');
    return await res.json();
  } catch (error) {
    console.error('Error fetching slot requests:', error);
    throw error;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId) {
  try {
    const res = await fetch(`${API_BASE_URL}/scheduling/notification/${notificationId}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: true }),
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return await res.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Create slot booking request
export async function createSlotRequest(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/scheduling/slotrequest/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create slot request');
    return await res.json();
  } catch (error) {
    console.error('Error creating slot request:', error);
    throw error;
  }
}
