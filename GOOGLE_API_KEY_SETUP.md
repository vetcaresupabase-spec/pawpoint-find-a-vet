# Google API Key Setup

## How to Set the API Key

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard → your project → **Settings** → **Edge Functions** → **Manage secrets**

### Step 2: Add the Secret
1. Click **"Add new secret"** or **"Manage secrets"**
2. Enter:
   - **Name:** `GOOGLE_PLACES_API_KEY`
   - **Value:** *(your Google Places API key — never commit this to git)*
3. Click **Save**

### Step 3: Verify
1. Go to http://localhost:8080
2. Search for `dog` + `Berlin`
3. You should see Google results appear

---

## Important

- **Never commit API keys to version control.**
- The key should only exist as a Supabase Edge Function secret.
- If a key is accidentally exposed, rotate it immediately in Google Cloud Console.
