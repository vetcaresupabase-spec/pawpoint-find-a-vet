# 🔑 Quick Login Credentials

## ⚠️ IMPORTANT: Use These Exact Emails

The test users in the database have these exact email addresses.

---

## 🐾 Pet Owner Accounts

### Lalit (Pet Owner)
- **Email:** `lalit@petowner.com`
- **Password:** `lalit@123`
- **Dashboard:** Will redirect to `/pet-owner-dashboard`

### Jaidev (Pet Owner)
- **Email:** `jaidev@petowner.com`
- **Password:** `jaidev@123`
- **Dashboard:** Will redirect to `/pet-owner-dashboard`

### Mirea (Pet Owner)
- **Email:** `mirea@petowner.com`
- **Password:** `mirea@123`
- **Dashboard:** Will redirect to `/pet-owner-dashboard`

---

## 🏥 Veterinarian Accounts

### Berlin Vets (5 clinics)

#### 1. Happy Paws Berlin
- **Email:** `berlin1@vet.com`
- **Password:** `berlin@123`
- **Dashboard:** Will redirect to `/vet-dashboard`

#### 2. Tierarzt am Alex
- **Email:** `berlin2@vet.com`
- **Password:** `berlin@123`

#### 3. Berlin Pet Clinic
- **Email:** `berlin3@vet.com`
- **Password:** `berlin@123`

#### 4. Vet Center Mitte
- **Email:** `berlin4@vet.com`
- **Password:** `berlin@123`

#### 5. Tierklinik Prenzlauer Berg
- **Email:** `berlin5@vet.com`
- **Password:** `berlin@123`

---

### Munich Vets (3 clinics)

#### 1. München Tierklinik
- **Email:** `munich1@vet.com`
- **Password:** `munich@123`

#### 2. Vet Practice Bavaria
- **Email:** `munich2@vet.com`
- **Password:** `munich@123`

#### 3. Pet Care München
- **Email:** `munich3@vet.com`
- **Password:** `munich@123`

---

### Hamburg Vets (2 clinics)

#### 1. Hamburg Animal Hospital
- **Email:** `hamburg1@vet.com`
- **Password:** `hamburg@123`

#### 2. Tierklinik Elbe
- **Email:** `hamburg2@vet.com`
- **Password:** `hamburg@123`

---

## 🎯 How to Test

### Test Pet Owner Flow:
1. Go to `http://127.0.0.1:8080`
2. Click "Log in" button
3. Use: `lalit@petowner.com` / `lalit@123`
4. You'll be redirected to Pet Owner Dashboard
5. Click "Book Appointment" or search for vets

### Test Vet Flow:
1. Go to `http://127.0.0.1:8080/for-vets`
2. Click "Join as a Vet" button
3. Switch to "Login" tab
4. Use: `berlin1@vet.com` / `berlin@123`
5. You'll be redirected to Vet Dashboard
6. See your clinic's appointments, services, hours, staff, and analytics

---

## 🔍 Search Test Data

### Search by Location:
- **Berlin:** `http://127.0.0.1:8080/search?petType=dog&location=berlin` (5 clinics)
- **Munich:** `http://127.0.0.1:8080/search?petType=cat&location=munich` (3 clinics)
- **Hamburg:** `http://127.0.0.1:8080/search?petType=dog&location=hamburg` (2 clinics)

---

## ❌ Common Login Errors

### "Invalid login credentials"
- ✅ **Make sure you're using the exact email** from this list
- ✅ Emails are case-sensitive
- ✅ No extra spaces in email or password
- ✅ Example: `berlin1@vet.com` (NOT `berlin.vet@clinic.com`)

### "User not found"
- The user might not exist in the database
- Check the `TEST_USERS.md` file for the complete list

---

**Last Updated:** $(date)
**Server:** `http://127.0.0.1:8080`




