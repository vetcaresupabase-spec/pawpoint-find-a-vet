import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const testUsers = [
  // Pet Owners
  { email: 'lalit@petowner.com', password: 'lalit@123', role: 'pet_owner', name: 'Lalit Pet Owner' },
  { email: 'jaidev@petowner.com', password: 'jaidev@123', role: 'pet_owner', name: 'Jaidev Pet Owner' },
  { email: 'mirea@petowner.com', password: 'mirea@123', role: 'pet_owner', name: 'Mirea Pet Owner' },
  
  // Vets - Berlin
  { email: 'berlin1@vet.com', password: 'berlin@123', role: 'vet', name: 'Dr. Berlin One', clinic: 'Happy Paws Berlin' },
  { email: 'berlin2@vet.com', password: 'berlin@123', role: 'vet', name: 'Dr. Berlin Two', clinic: 'Tierarzt am Alex' },
  { email: 'berlin3@vet.com', password: 'berlin@123', role: 'vet', name: 'Dr. Berlin Three', clinic: 'Berlin Pet Clinic' },
  { email: 'berlin4@vet.com', password: 'berlin@123', role: 'vet', name: 'Dr. Berlin Four', clinic: 'Vet Center Mitte' },
  { email: 'berlin5@vet.com', password: 'berlin@123', role: 'vet', name: 'Dr. Berlin Five', clinic: 'Tierklinik Prenzlauer Berg' },
  
  // Vets - Munich
  { email: 'munich1@vet.com', password: 'munich@123', role: 'vet', name: 'Dr. Munich One', clinic: 'München Tierklinik' },
  { email: 'munich2@vet.com', password: 'munich@123', role: 'vet', name: 'Dr. Munich Two', clinic: 'Vet Practice Bavaria' },
  { email: 'munich3@vet.com', password: 'munich@123', role: 'vet', name: 'Dr. Munich Three', clinic: 'Pet Care München' },
  
  // Vets - Hamburg
  { email: 'hamburg1@vet.com', password: 'hamburg@123', role: 'vet', name: 'Dr. Hamburg One', clinic: 'Hamburg Animal Hospital' },
  { email: 'hamburg2@vet.com', password: 'hamburg@123', role: 'vet', name: 'Dr. Hamburg Two', clinic: 'Tierklinik Elbe' },
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

    for (const user of testUsers) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          role: user.role,
          full_name: user.name,
          clinic_name: user.clinic || null
        }
      });

      if (error) {
        errors.push({ email: user.email, error: error.message });
      } else {
        results.push({ email: user.email, id: data.user?.id, role: user.role });
        
        // Link vet to clinic if applicable
        if (user.role === 'vet' && user.clinic && data.user) {
          const { error: updateError } = await supabase
            .from('clinics')
            .update({ owner_id: data.user.id })
            .eq('email', user.email);
          
          if (updateError) {
            errors.push({ email: user.email, clinic_link_error: updateError.message });
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      created: results.length,
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






