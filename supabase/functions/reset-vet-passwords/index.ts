import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const vetUsers = [
  { email: 'berlin1@vet.com', password: 'berlin@123' },
  { email: 'berlin2@vet.com', password: 'berlin@123' },
  { email: 'berlin3@vet.com', password: 'berlin@123' },
  { email: 'berlin4@vet.com', password: 'berlin@123' },
  { email: 'berlin5@vet.com', password: 'berlin@123' },
  { email: 'munich1@vet.com', password: 'munich@123' },
  { email: 'munich2@vet.com', password: 'munich@123' },
  { email: 'munich3@vet.com', password: 'munich@123' },
  { email: 'hamburg1@vet.com', password: 'hamburg@123' },
  { email: 'hamburg2@vet.com', password: 'hamburg@123' },
];

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const results = [];
    const errors = [];

    // Get all vet users
    for (const vetUser of vetUsers) {
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        errors.push({ email: vetUser.email, error: 'Failed to list users: ' + listError.message });
        continue;
      }

      const existingUser = users?.users.find(u => u.email === vetUser.email);
      
      if (existingUser) {
        // Update the existing user's password
        const { data, error } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { password: vetUser.password }
        );

        if (error) {
          errors.push({ email: vetUser.email, error: error.message });
        } else {
          results.push({ 
            email: vetUser.email, 
            id: existingUser.id, 
            status: 'password_reset',
            new_password: vetUser.password
          });
        }
      } else {
        errors.push({ email: vetUser.email, error: 'User not found' });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      reset: results.length,
      users: results,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (err) {
    return new Response(JSON.stringify({ 
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});






