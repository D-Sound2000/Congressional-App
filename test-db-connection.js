// Quick test to verify database connection
import { supabase } from './lib/supabase.js';

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('recipes').select('count');
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('You need to run the SQL schema first!');
    } else {
      console.log('✅ Database connected successfully!');
      console.log('Recipe count:', data);
    }
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
}

testConnection();
