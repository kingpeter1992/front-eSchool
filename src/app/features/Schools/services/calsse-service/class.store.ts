import { inject, Injectable, signal, computed } from '@angular/core';
import { Toast } from '../../../../shared/toaste/Toast';
import { SchoolClassResponse, CreateClassDTO, UpdateClassDTO } from '../../models/class.model';
import { ClassService } from './class.service';

@Injectable({
  providedIn: 'root'
})
export class ClassStore {
  private readonly classService = inject(ClassService);
  private readonly toast = inject(Toast);

  // Signaux d'état
  readonly classes = signal<SchoolClassResponse[]>([]);
  readonly loading = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly error = signal<string | null>(null);

  // Liste filtrée par le moteur de recherche
  readonly filteredClasses = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.classes();
    return this.classes().filter(cls =>
      cls.name.toLowerCase().includes(query) ||
      cls.levelName?.toLowerCase().includes(query)
    );
  });

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }


// Mise à jour de createClass pour attraper les erreurs backend (ex: 400 Bad Request)
createClass(dto: CreateClassDTO, onSuccess?: () => void): void {
  this.loading.set(true);
  this.classService.createClass(dto).subscribe({
    next: () => {
      this.loading.set(false);
      this.toast.showSuccess('Classe créée avec succès');
      if (onSuccess) onSuccess();
    },
    error: (err) => {
      this.loading.set(false);
      // Affiche le message d'erreur envoyé par le backend (ex: "Cette salle a déjà atteint sa capacité...")
      const message = err?.error?.message || 'Erreur lors de la création de la classe';
      this.toast.showError(message);
    }
  });
  }

  updateClass(id: string, dto: UpdateClassDTO, onSuccess?: () => void): void {
    this.isSubmitting.set(true);
    this.classService.updateClass(id, dto).subscribe({
      next: (updated) => {
        this.classes.update(list => list.map(c => c.id === id ? updated : c));
        this.isSubmitting.set(false);
        this.toast.showSuccess('Classe mise à jour avec succès !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.toast.showError(err?.error?.message || 'Erreur de mise à jour');
        this.isSubmitting.set(false);
      }
    });
  }

  deleteClass(id: string, onSuccess?: () => void): void {
    this.classService.deleteClass(id).subscribe({
      next: () => {
        this.classes.update(list => list.filter(c => c.id !== id));
        this.toast.showSuccess('Classe supprimée avec succès !');
        if (onSuccess) onSuccess();
      },
      error: (err) => {
        this.toast.showError(err?.error?.message || 'Erreur de suppression');
      }
    });
  }

// Fonction d'aide pour compter combien de classes occupent une salle
classesCountByRoom = computed(() => {
  const counts: Record<string, number> = {};
  this.classes().forEach((cls) => {
    if (cls.roomId) {
      counts[cls.roomId] = (counts[cls.roomId] || 0) + 1;
    }
  });
  return counts;
});

loadClassesByCampus(campusId: string): void {
    if (!campusId) return;

    this.loading.set(true);
    this.error.set(null);

    this.classService.getClassesByCampus(campusId).subscribe({
      next: (data) => {
        this.classes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        const message = err?.error?.message || 'Erreur lors du chargement des classes du campus';
        this.error.set(message);
        this.loading.set(false);
      }
    });
  }
}
