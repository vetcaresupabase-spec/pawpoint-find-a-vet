import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Calendar } from "lucide-react";
import { differenceInYears, differenceInMonths, parseISO } from "date-fns";

interface Pet {
  id: string;
  owner_name: string;
  pet_type: string;
  breed: string;
  name?: string;
  date_of_birth?: string;
  sex: string;
  neutered_spayed: string;
  photo_url?: string;
  notes?: string;
  created_at: string;
}

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (petId: string) => void;
}

export function PetCard({ pet, onEdit, onDelete }: PetCardProps) {
  const calculateAge = (dateOfBirth: string) => {
    const dob = parseISO(dateOfBirth);
    const years = differenceInYears(new Date(), dob);
    
    if (years > 0) {
      return `${years} year${years > 1 ? "s" : ""} old`;
    }
    
    const months = differenceInMonths(new Date(), dob);
    if (months > 0) {
      return `${months} month${months > 1 ? "s" : ""} old`;
    }
    
    return "Less than a month old";
  };

  const getPetTypeColor = (type: string) => {
    switch (type) {
      case "Dog":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Cat":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Ferret":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const defaultPhoto = `https://api.dicebear.com/7.x/shapes/svg?seed=${pet.id}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {/* Pet Photo */}
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={pet.photo_url || defaultPhoto}
            alt={pet.name || "Pet"}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Actions Menu */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/90 hover:bg-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(pet)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(pet.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Pet Type Badge */}
        <div className="absolute top-2 left-2">
          <Badge className={getPetTypeColor(pet.pet_type)}>
            {pet.pet_type}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Pet Name */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {pet.name || "Unnamed Pet"}
          </h3>
          <p className="text-sm text-gray-600">{pet.breed}</p>
        </div>

        {/* Owner Info */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Owner:</span>
          <span className="font-medium text-gray-900">{pet.owner_name}</span>
        </div>

        {/* Age */}
        {pet.date_of_birth && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{calculateAge(pet.date_of_birth)}</span>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Sex</p>
            <p className="text-sm font-medium text-gray-900">{pet.sex}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Neutered/Spayed</p>
            <p className="text-sm font-medium text-gray-900">{pet.neutered_spayed}</p>
          </div>
        </div>

        {/* Notes Preview */}
        {pet.notes && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-700 line-clamp-2">{pet.notes}</p>
          </div>
        )}

        {/* Action Button */}
        <Button className="w-full mt-3" variant="outline" size="sm">
          Book Appointment
        </Button>
      </CardContent>
    </Card>
  );
}

