import { Injectable, inject, signal } from '@angular/core';
import {
  BuildingResponse,
  CampusRequest,
  CampusResponse,
  CampusStatus,
  CreateBuildingRequest,
  CreateRoomRequest,
  RoomRequest,
  ScheduleDTO,
} from '../../models/school.model';
import { CampusService } from './campus.service';
import { Toast } from '../../../../shared/toaste/Toast';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CampusStore {

  private readonly campusService = inject(CampusService);
  private readonly toast = inject(Toast);
  readonly schedules = signal<ScheduleDTO[]>([]);

  readonly campuses = signal<CampusResponse[]>([]);
  readonly buildings = signal<BuildingResponse[]>([]);
  readonly loading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly searchQuery = signal<string>('');
  private lastLoadedSchoolId: string | null = null;

  loadCampusesBySchool(schoolId: string): void {
    if (!schoolId) return;
    this.loading.set(true);
    this.error.set(null);

    this.campusService.getCampusesBySchool(schoolId).subscribe({
      next: (data) => {
        this.campuses.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors du chargement des campus');
        this.loading.set(false);
      },
    });
  }

  getCampusById(id: string) {
    return this.campusService.getCampusById(id);
  }

  createCampus(dto: CampusRequest, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.campusService.createCampus(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.showSuccess('Campus créé avec succès !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la création du campus');
        this.isSubmitting.set(false);
      },
    });
  }

  updateCampus(id: string, dto: CampusRequest, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.campusService.updateCampus(id, dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.showSuccess('Campus mis à jour avec succès !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la modification du campus');
        this.isSubmitting.set(false);
      },
    });
  }

  deleteCampus(id: string, schoolId: string): void {
    this.loading.set(true);
    this.campusService.deleteCampus(id).subscribe({
      next: () => {
        this.campuses.update((list) => list.filter((c) => c.id !== id));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la suppression');
        this.loading.set(false);
      },
    });
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  // UC-CAM-011 : Statut
  changeStatus(id: string, status: CampusStatus, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.campusService.updateCampusStatus(id, status).subscribe({
      next: (updatedCampus) => {
        this.campuses.update((list) => list.map((c) => (c.id === id ? updatedCampus : c)));
        this.isSubmitting.set(false);
        this.toast.showSuccess(`Statut mis à jour : ${status}`);
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors du changement de statut');
        this.isSubmitting.set(false);
      },
    });
  }

  // UC-CAM-005 : Responsable
  assignManager(id: string, managerId: string, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.campusService.assignManager(id, managerId).subscribe({
      next: (updatedCampus) => {
        this.campuses.update((list) => list.map((c) => (c.id === id ? updatedCampus : c)));
        this.isSubmitting.set(false);
        this.toast.showSuccess('Responsable affecté avec succès !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || "Erreur lors de l'affectation du responsable");
        this.isSubmitting.set(false);
      },
    });
  }

  // UC-CAM-008 : Capacité
  updateCapacity(id: string, capacity: number, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.campusService.updateCapacity(id, capacity).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.showSuccess('Capacité mise à jour avec succès !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la mise à jour de la capacité');
        this.isSubmitting.set(false);
      },
    });
  }

  // UC-CAM-006 : Bâtiments
// campus.store.ts
loadBuildings(campusId: string) {
  this.campusService.getBuildingsByCampus(campusId).subscribe({
    next: (buildings) => {
      this.buildings.set(buildings);
    },
    error: (err) => this.error.set(err.message)
  });
}

  createBuilding(dto: CreateBuildingRequest, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.campusService.createBuilding(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.showSuccess('Bâtiment ajouté avec succès !');
        this.loadBuildings(dto.campusId);
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || "Erreur lors de l'ajout du bâtiment");
        this.isSubmitting.set(false);
      },
    });
  }

  updateBuilding(
    id: string,
    dto: { campusId: string; name: string; code?: string },
    onSuccess?: () => void,
  ): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.campusService.updateBuilding(id, dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.showSuccess('Bâtiment mis à jour avec succès !');
        this.loadBuildings(dto.campusId);
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la mise à jour du bâtiment');
        this.isSubmitting.set(false);
      },
    });
  }

  // UC-CAM-007 : Salles
  createRoom(dto: CreateRoomRequest, campusId: string, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.campusService.createRoom(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.showSuccess('Salle ajoutée avec succès !');
        this.loadBuildings(campusId);
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || "Erreur lors de l'ajout de la salle");
        this.isSubmitting.set(false);
      },
    });
  }

  updateRoom(id: string, dto: RoomRequest, campusId: string, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.campusService.updateRoom(id, dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.showSuccess('Salle mise à jour avec succès !');
        this.loadBuildings(campusId);
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erreur lors de la mise à jour de la salle');
        this.isSubmitting.set(false);
      },
    });
  }

  // UC-CAM-009 : Équipements
  addEquipmentToRoom(
    dto: { roomId: string; name: string; quantity: number; state: string },
    campusId: string,
    onSuccess?: () => void,
  ): void {
    this.isSubmitting.set(true);
    this.error.set(null);

    this.campusService.addEquipmentToRoom(dto.roomId, dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.showSuccess('Équipement ajouté avec succès !');
        this.loadBuildings(campusId);
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.error.set(err.error?.message || "Erreur lors de l'ajout de l'équipement");
        this.isSubmitting.set(false);
      },
    });
  }
deleteEquipment(
  roomId: string,
  equipmentId: string,
  campusId?: string,
  onSuccess?: () => void
): void {
  this.isSubmitting.set(true);
  this.error.set(null);

  this.campusService.deleteEquipment(roomId, equipmentId).subscribe({
    next: () => {
      this.isSubmitting.set(false);
      this.toast.showSuccess('Équipement supprimé avec succès !');
      if (campusId) this.loadBuildings(campusId);
      if (onSuccess) onSuccess();
    },
    error: (err) => {
      const errorMsg = err.error?.message || "Erreur lors de la suppression de l'équipement";
      this.error.set(errorMsg);
      this.toast.showError(errorMsg);
      this.isSubmitting.set(false);
    }
  });
}
// UC-CAM-009-UPDATE : Mise à jour d'un équipement
updateEquipment(
  roomId: string,
  updatedData: { id: string; name: string; quantity: number; state: string },
  campusId?: string,
  onSuccess?: () => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    this.isSubmitting.set(true);
    this.error.set(null);

    // Adaptez la signature selon votre endpoint service (ex: updateEquipment(roomId, equipmentId, data) ou updateEquipment(equipmentId, data))
    this.campusService.updateEquipment(roomId, updatedData.id, updatedData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.showSuccess('Équipement mis à jour avec succès !');

        // Recharge la liste des bâtiments/salles pour rafraîchir les données
        if (campusId) {
          this.loadBuildings(campusId);
        }

        if (onSuccess) onSuccess();
        resolve();
      },
      error: (err) => {
        const errorMsg = err.error?.message || "Erreur lors de la mise à jour de l'équipement";
        this.error.set(errorMsg);
        this.toast.showError(errorMsg);
        this.isSubmitting.set(false);
        reject(err);
      },
    });
  });
}

  loadCampusSchedules(campusId: string): void {
  this.loading.set(true);
  this.campusService.getCampusSchedules(campusId).subscribe({
    next: (data) => {
      this.schedules.set(data);
      this.loading.set(false);
    },
    error: (err) => {
      this.error.set(err.error?.message || 'Erreur lors du chargement des horaires');
      this.loading.set(false);
    }
  });
}

saveCampusSchedules(campusId: string, schedules: ScheduleDTO[], onSuccess?: () => void): void {
  this.isSubmitting.set(true);
  this.campusService.saveCampusSchedules(campusId, schedules).subscribe({
    next: (updatedSchedules) => {
      this.schedules.set(updatedSchedules);
      this.isSubmitting.set(false);
      this.toast.showSuccess('Horaires enregistrés avec succès !');
      if (onSuccess) onSuccess();
    },
    error: (err) => {
      this.error.set(err.error?.message || "Erreur lors de l'enregistrement des horaires");
      this.isSubmitting.set(false);
    }
  });
}


loadCampusesObservable(schoolId: string, forceRefresh = false): Observable<CampusResponse[]> {
    if (!schoolId) return of([]);
    if (!forceRefresh && this.lastLoadedSchoolId === schoolId && this.campuses().length > 0) {
      return of(this.campuses());
    }
    return this.campusService.getCampusesBySchool(schoolId).pipe(
      tap((data) => {
        this.campuses.set(data);
        this.lastLoadedSchoolId = schoolId;
      })
    );
  }
}
