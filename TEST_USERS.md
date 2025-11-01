# Test User Accounts

## Pet Owners (3 accounts)

| Email                  | Password    | Role       |
|------------------------|-------------|------------|
| lalit@petowner.com     | lalit@123   | pet_owner  |
| jaidev@petowner.com    | jaidev@123  | pet_owner  |
| mirea@petowner.com     | mirea@123   | pet_owner  |

## Veterinarians (10 accounts with clinics)

### Berlin (5 vets)

| Email            | Password    | Clinic Name                      | City   |
|------------------|-------------|----------------------------------|--------|
| berlin1@vet.com  | berlin@123  | Happy Paws Berlin                | Berlin |
| berlin2@vet.com  | berlin@123  | Tierarzt am Alex                 | Berlin |
| berlin3@vet.com  | berlin@123  | Berlin Pet Clinic                | Berlin |
| berlin4@vet.com  | berlin@123  | Vet Center Mitte                 | Berlin |
| berlin5@vet.com  | berlin@123  | Tierklinik Prenzlauer Berg       | Berlin |

### Munich (3 vets)

| Email            | Password    | Clinic Name                      | City   |
|------------------|-------------|----------------------------------|--------|
| munich1@vet.com  | munich@123  | München Tierklinik               | Munich |
| munich2@vet.com  | munich@123  | Vet Practice Bavaria             | Munich |
| munich3@vet.com  | munich@123  | Pet Care München                 | Munich |

### Hamburg (2 vets)

| Email             | Password    | Clinic Name                      | City    |
|-------------------|-------------|----------------------------------|---------|
| hamburg1@vet.com  | hamburg@123 | Hamburg Animal Hospital          | Hamburg |
| hamburg2@vet.com  | hamburg@123 | Tierklinik Elbe                  | Hamburg |

## How to Create These Users

Since Supabase auth.users can only be created via the Auth API, run this in Supabase SQL Editor or use the signup flow in the app:

```sql
-- This requires service role key; adjust for your setup
-- Or use the app signup UI with these credentials
```

Or use the Supabase Dashboard:
- Authentication → Users → Add user (manual invite)
- Enter email/password, set user_metadata.role = "pet_owner" or "vet"

## Testing

- Pet owner login → lands on /pet-owner-dashboard
- Vet login → lands on /vet-dashboard
- Search for clinics at /search?location=Berlin (or Munich, Hamburg)
- Click "View Profile" → see clinic details
- Click "Book Appointment" → redirects to booking flow






