# Pet Management Feature Documentation

## Overview
The Pet Management feature allows pet owners to register and manage their pets through the dashboard. Pet information is displayed as cards with comprehensive details and photos.

## Features

### 1. Add Pet Functionality
Pet owners can add pets with the following information:

#### Mandatory Fields
- **Owner Name** ⭐ (Required)
- **Pet Type** ⭐ (Required) - Options: Dog / Cat / Ferret / Other
- **Breed** ⭐ (Required)

#### Recommended Fields
- **Pet Name** 🌟 (Recommended)
- **Date of Birth** 🌟 (Recommended) - Enables automatic age calculation

#### Optional Fields
- **Sex** - Options: Male / Female / Unknown (Default: Unknown)
- **Neutered/Spayed** - Options: Yes / No / Unknown (Default: Unknown)
- **Photo** - Square portrait format (max 5MB)
- **Additional Notes** - Free text field for special information

### 2. Pet Card Display
Each pet is displayed as a card showing:

- **Pet Photo** - Square portrait or generated avatar if no photo
- **Pet Type Badge** - Color-coded by type (Dog: Blue, Cat: Purple, Ferret: Orange, Other: Gray)
- **Pet Name & Breed**
- **Owner Name**
- **Age** - Automatically calculated from date of birth (e.g., "2 years old", "5 months old")
- **Sex**
- **Neutered/Spayed Status**
- **Notes Preview** - First 2 lines if notes exist
- **Actions Menu** - Edit and Delete options
- **Book Appointment Button**

### 3. Pet Management Actions
- **Add Pet** - Opens dialog to add new pet
- **Edit Pet** - (Coming soon)
- **Delete Pet** - Removes pet from profile with confirmation
- **Book Appointment** - Quick action from pet card (Coming soon)

## Database Schema

### Table: `pets`
```sql
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  pet_type TEXT NOT NULL CHECK (pet_type IN ('Dog', 'Cat', 'Ferret', 'Other')),
  breed TEXT NOT NULL,
  name TEXT,
  date_of_birth DATE,
  sex TEXT DEFAULT 'Unknown' CHECK (sex IN ('Male', 'Female', 'Unknown')),
  neutered_spayed TEXT DEFAULT 'Unknown' CHECK (neutered_spayed IN ('Yes', 'No', 'Unknown')),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Bucket: `pet-photos`
- **Public Access**: Yes (read-only)
- **Upload Permission**: Authenticated users only
- **Max File Size**: 5MB
- **Supported Formats**: JPG, PNG, WEBP
- **Recommended**: Square photos (1:1 aspect ratio)

## Row Level Security (RLS)

### Pets Table Policies
1. **View Own Pets**: Users can only view their own pets
   ```sql
   USING (auth.uid() = owner_id)
   ```

2. **Create Own Pets**: Users can only create pets for themselves
   ```sql
   WITH CHECK (auth.uid() = owner_id)
   ```

3. **Update Own Pets**: Users can only update their own pets
   ```sql
   USING (auth.uid() = owner_id)
   ```

4. **Delete Own Pets**: Users can only delete their own pets
   ```sql
   USING (auth.uid() = owner_id)
   ```

### Storage Policies
1. **Upload**: Authenticated users can upload to `pet-photos` folder
2. **View**: Public read access to all pet photos
3. **Update/Delete**: Authenticated users can manage their uploads

## Components

### 1. AddPetDialog.tsx
- **Purpose**: Modal dialog for adding new pets
- **Features**:
  - Form validation with Zod schema
  - Photo upload with preview
  - Responsive layout
  - Error handling
  - Loading states
  - Success callback for list refresh

### 2. PetCard.tsx
- **Purpose**: Display individual pet information
- **Features**:
  - Responsive card layout
  - Photo display with fallback avatar
  - Age calculation from DOB
  - Color-coded pet type badges
  - Action dropdown menu
  - Truncated notes preview

### 3. PetOwnerDashboard.tsx (Updated)
- **Purpose**: Main dashboard for pet owners
- **Updates**:
  - Added "My Pets" tab
  - Integrated AddPetDialog
  - Pet list display with grid layout
  - Pet deletion functionality
  - Real-time list updates with React Query

## User Flow

### Adding a Pet
1. User clicks "Add a Pet" card or button
2. Dialog opens with form
3. User fills in required and optional fields
4. User optionally uploads photo
5. User submits form
6. Photo is uploaded to storage (if provided)
7. Pet record is created in database
8. Success toast notification
9. Pet list refreshes automatically
10. Dialog closes

### Viewing Pets
1. User navigates to "My Pets" tab
2. All pets are displayed in a responsive grid
3. Each pet shows comprehensive information
4. Hover effects and interactive cards

### Deleting a Pet
1. User clicks three-dot menu on pet card
2. User selects "Delete"
3. Confirmation dialog appears
4. User confirms deletion
5. Pet is removed from database
6. Success toast notification
7. Pet list refreshes automatically

## API Integration

### Supabase Queries

#### Fetch User's Pets
```typescript
const { data: pets } = await supabase
  .from("pets")
  .select("*")
  .eq("owner_id", user.id)
  .order("created_at", { ascending: false });
```

#### Add New Pet
```typescript
const { error } = await supabase
  .from("pets")
  .insert({
    owner_id: user.id,
    owner_name: values.owner_name,
    pet_type: values.pet_type,
    breed: values.breed,
    name: values.name || null,
    date_of_birth: values.date_of_birth || null,
    sex: values.sex,
    neutered_spayed: values.neutered_spayed,
    photo_url: photoUrl,
    notes: values.notes || null,
  });
```

#### Delete Pet
```typescript
const { error } = await supabase
  .from("pets")
  .delete()
  .eq("id", petId);
```

#### Upload Pet Photo
```typescript
const { error } = await supabase.storage
  .from("pet-photos")
  .upload(filePath, photoFile);

const { data } = supabase.storage
  .from("pet-photos")
  .getPublicUrl(filePath);
```

## Age Calculation Logic

The system automatically calculates pet age from date of birth:

- **Years**: If pet is 1+ year old → "2 years old"
- **Months**: If pet is less than 1 year → "5 months old"
- **New**: If pet is less than 1 month → "Less than a month old"

Uses `date-fns` library for accurate date calculations.

## Responsive Design

### Breakpoints
- **Mobile** (< 768px): 1 column grid
- **Tablet** (768px - 1024px): 2 column grid
- **Desktop** (1024px+): 3 column grid

### Card Layout
- Square photo at top
- Pet type badge (top-left)
- Actions menu (top-right)
- Information in organized sections
- Full-width action button at bottom

## Error Handling

### Upload Errors
- Invalid file type → Toast notification
- File too large → Toast notification
- Upload failure → Pet created without photo

### Database Errors
- Validation errors → Form field errors
- Insert failures → Toast notification
- Delete failures → Toast notification

### Network Errors
- Loading states during fetch
- Retry with React Query
- Error boundaries for component crashes

## Future Enhancements

### Planned Features
1. **Edit Pet** - Update existing pet information
2. **Pet Medical Records** - Track vaccinations, medications, visits
3. **Pet Documents** - Upload and store documents
4. **Multiple Photos** - Gallery of pet photos
5. **Breed Auto-suggest** - Dropdown with common breeds
6. **Microchip Number** - Track microchip information
7. **Insurance Details** - Pet insurance information
8. **Emergency Contacts** - Vet and caregiver contacts
9. **Weight Tracking** - Monitor pet weight over time
10. **Appointment History** - View past appointments per pet

### Improvements
- Photo cropping tool for better square portraits
- Bulk import for multiple pets
- Export pet information as PDF
- Share pet profile link
- Pet QR code for identification

## Testing

### Manual Testing Steps
1. ✅ Log in as pet owner
2. ✅ Click "Add a Pet" from dashboard
3. ✅ Fill form with all mandatory fields
4. ✅ Upload a square photo
5. ✅ Submit and verify pet appears in list
6. ✅ Navigate to "My Pets" tab
7. ✅ Verify pet card displays correctly
8. ✅ Test delete functionality
9. ✅ Test without photo (uses generated avatar)
10. ✅ Test age calculation with different DOBs

### Database Migration Testing
Run migrations in order:
```bash
# 1. Update pets table schema
supabase migration up 20251103000000_update_pets_table.sql

# 2. Create pet-photos storage bucket
supabase migration up 20251103000001_create_pet_photos_bucket.sql
```

## Deployment Checklist

- [ ] Run database migrations
- [ ] Create pet-photos storage bucket in Supabase
- [ ] Configure storage bucket policies
- [ ] Test pet creation
- [ ] Test photo upload
- [ ] Test pet deletion
- [ ] Verify RLS policies
- [ ] Test responsive layout on mobile
- [ ] Verify age calculation
- [ ] Test error scenarios

## Support & Troubleshooting

### Common Issues

**Q: Photos not uploading**
A: Check storage bucket exists and policies are correct

**Q: Can't see other users' pets**
A: Correct - RLS policies restrict to own pets only

**Q: Age not calculating**
A: Ensure date_of_birth is in valid date format (YYYY-MM-DD)

**Q: Pet deletion not working**
A: Check RLS policies allow deletion for owner_id

---

**Last Updated**: 2025-11-03
**Version**: 1.0.0
**Feature Status**: ✅ Complete (Edit feature coming soon)

