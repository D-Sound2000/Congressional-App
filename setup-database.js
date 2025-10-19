const { createClient } = require('@supabase/supabase-js');

// Your Supabase configuration
const supabaseUrl = 'https://phmmuurmjzcfbtyekhvi.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY_HERE'; // You'll need to get this from Supabase

// Create a client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up database tables...');
  
  try {
    // Create the update function
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    });

    if (functionError) {
      console.log('Function already exists or error:', functionError.message);
    }

    // Create profiles table
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          avatar_url TEXT,
          diabetes_type VARCHAR(20),
          insulin_dependent BOOLEAN DEFAULT false,
          medications TEXT[],
          emergency_contact TEXT,
          doctor_info TEXT,
          glucose_targets JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (profilesError) {
      console.log('Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table created');
    }

    // Create recipes table
    const { error: recipesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS recipes (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          image_url TEXT,
          prep_time INTEGER,
          cook_time INTEGER,
          servings INTEGER DEFAULT 1,
          calories INTEGER,
          carbs DECIMAL(5,2),
          protein DECIMAL(5,2),
          fat DECIMAL(5,2),
          fiber DECIMAL(5,2),
          sugar DECIMAL(5,2),
          sodium DECIMAL(5,2),
          category VARCHAR(50),
          difficulty VARCHAR(20),
          tags TEXT[],
          ingredients JSONB,
          instructions JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (recipesError) {
      console.log('Recipes table error:', recipesError.message);
    } else {
      console.log('✅ Recipes table created');
    }

    // Create glucose_logs table
    const { error: glucoseError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS glucose_logs (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          glucose_value INTEGER NOT NULL,
          measurement_time TIMESTAMP WITH TIME ZONE NOT NULL,
          context VARCHAR(50),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (glucoseError) {
      console.log('Glucose logs table error:', glucoseError.message);
    } else {
      console.log('✅ Glucose logs table created');
    }

    // Create favorite_recipes table
    const { error: favoritesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS favorite_recipes (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          recipe_id INTEGER NOT NULL,
          recipe_data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, recipe_id)
        );
      `
    });

    if (favoritesError) {
      console.log('Favorite recipes table error:', favoritesError.message);
    } else {
      console.log('✅ Favorite recipes table created');
    }

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE glucose_logs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE favorite_recipes ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.log('RLS error:', rlsError.message);
    } else {
      console.log('✅ Row Level Security enabled');
    }

    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

// Run the setup
setupDatabase();
