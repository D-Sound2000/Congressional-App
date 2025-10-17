import { supabase } from './supabase';

// Planner item types - removed activity/exercise as requested
export interface PlannerItem {
  id: number;
  user_id: string;
  plan_date: string;
  item_type: 'medication' | 'meal_time' | 'activity' | 'reminder' | 'exercise' | 'checkup';
  title: string;
  description?: string;
  scheduled_time?: string; // HH:MM format
  duration?: number; // in minutes
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'morning' | 'afternoon' | 'evening' | 'bedtime';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreatePlannerItemData {
  plan_date: string;
  item_type: PlannerItem['item_type'];
  title: string;
  description?: string;
  scheduled_time?: string;
  duration?: number;
  priority?: PlannerItem['priority'];
  category: PlannerItem['category'];
  metadata?: Record<string, any>;
}

export interface UpdatePlannerItemData {
  title?: string;
  description?: string;
  scheduled_time?: string;
  duration?: number;
  completed?: boolean;
  priority?: PlannerItem['priority'];
  category?: PlannerItem['category'];
  metadata?: Record<string, any>;
}

// Get planner items for a specific date
export const getPlannerItems = async (date: string): Promise<PlannerItem[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('planner_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_date', date)
      .order('scheduled_time', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error fetching planner items:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPlannerItems:', error);
    throw error;
  }
};

// Create a new planner item
export const createPlannerItem = async (itemData: CreatePlannerItemData): Promise<PlannerItem> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('planner_items')
      .insert({
        user_id: user.id,
        ...itemData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating planner item:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createPlannerItem:', error);
    throw error;
  }
};

// Update a planner item
export const updatePlannerItem = async (id: number, updates: UpdatePlannerItemData): Promise<PlannerItem> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('planner_items')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating planner item:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updatePlannerItem:', error);
    throw error;
  }
};

// Delete a planner item
export const deletePlannerItem = async (id: number): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('planner_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting planner item:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deletePlannerItem:', error);
    throw error;
  }
};

// Toggle completion status of a planner item
export const togglePlannerItemCompletion = async (id: number, completed: boolean): Promise<PlannerItem> => {
  return updatePlannerItem(id, { completed });
};

// Get planner items for a date range
export const getPlannerItemsInRange = async (startDate: string, endDate: string): Promise<PlannerItem[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('planner_items')
      .select('*')
      .eq('user_id', user.id)
      .gte('plan_date', startDate)
      .lte('plan_date', endDate)
      .order('plan_date', { ascending: true })
      .order('scheduled_time', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error fetching planner items in range:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPlannerItemsInRange:', error);
    throw error;
  }
};

// Get planner items by type for a specific date
export const getPlannerItemsByType = async (date: string, itemType: PlannerItem['item_type']): Promise<PlannerItem[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('planner_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_date', date)
      .eq('item_type', itemType)
      .order('scheduled_time', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error fetching planner items by type:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPlannerItemsByType:', error);
    throw error;
  }
};

// Helper function to format time for display
export const formatTime = (timeString?: string): string => {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
};

// Helper function to get items grouped by time of day
export const groupItemsByCategory = (items: PlannerItem[]): { [key: string]: PlannerItem[] } => {
  const grouped: { [key: string]: PlannerItem[] } = {
    morning: [],
    afternoon: [],
    evening: [],
    bedtime: [],
    unscheduled: []
  };

  items.forEach(item => {
    if (item.category && grouped[item.category]) {
      grouped[item.category].push(item);
    } else {
      grouped.unscheduled.push(item);
    }
  });

  return grouped;
};

// Helper function to get priority color
export const getPriorityColor = (priority: PlannerItem['priority']): string => {
  switch (priority) {
    case 'high': return '#f44336';
    case 'medium': return '#ff9800';
    case 'low': return '#4caf50';
    default: return '#666';
  }
};

// Helper function to get type icon
export const getTypeIcon = (itemType: PlannerItem['item_type']): string => {
  switch (itemType) {
    case 'medication': return '💊';
    case 'meal_time': return '🍽️';
    case 'activity': return '📝';
    case 'reminder': return '⏰';
    case 'exercise': return '🏃';
    case 'checkup': return '🩺';
    default: return '📋';
  }
};


