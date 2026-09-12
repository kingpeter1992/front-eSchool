import { Component, computed, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../services/school-imports';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CampusResponse,
  CampusRequest,
  CampusStatus,
  BuildingResponse,
  RoomResponse,
  EquipmentResponse,
  EquipmentRequest,
  RoomRequest,
  ScheduleDTO,
} from '../../models/school.model';
import { CampusStore } from '../../services/campus/campus.store';
import { StorageService } from '../../../../core/storage-service/storage-service';
import { AuthStoreService } from '../../../../core/services/auth-store-service';
import { Toast } from '../../../../shared/toaste/Toast';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AcademicStore } from '../../services/academic-structure/academic.store';
import { ClassStore } from '../../services/calsse-service/class.store';
import { CampusSchedulesTab } from '../details-capmpus/campus-schedules-tab/campus-schedules-tab';
import { CampusBuildingsTab } from '../details-capmpus/campus-buildings-tab/campus-buildings-tab';
import { CampusClassesTab } from '../details-capmpus/campus-classes-tab/campus-classes-tab';
import { CampusOverviewTab } from '../details-capmpus/campus-overview-tab/campus-overview-tab';
import { ExportService } from '../../services/export-service/export.service';
import { NotificationService } from '../../../../shared/snack-bar/notification.service';
import { CreateClassDTO, UpdateClassDTO } from '../../models/class.model';

const DAYS_ORDER: Record<string, string> = {
  MONDAY: 'Lundi',
  TUESDAY: 'Mardi',
  WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi',
  SATURDAY: 'Samedi',
  SUNDAY: 'Dimanche',
};

@Component({
  selector: 'app-dashboard-campus',
  standalone: true,
  imports: [
    SCHOOL_IMPORTS,
    CampusOverviewTab,
    CampusBuildingsTab,
    CampusClassesTab,
    CampusSchedulesTab,
    //custom-snack-bar.component
  ],
  templateUrl: './dashboard-campus.html',
  styleUrl: './dashboard-campus.scss',
})
export class DashboardCampus implements OnInit {

  // Vos services et signaux existants restent inchangés
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly campusStore = inject(CampusStore);
  readonly classeStore = inject(ClassStore);
  private readonly storageService = inject(StorageService);
  readonly auth = inject(AuthStoreService);
  private readonly toast = inject(Toast);
  private readonly fb = inject(FormBuilder);
  readonly academicStore = inject(AcademicStore);
  private readonly exportService = inject(ExportService);
  private readonly notificationService = inject(NotificationService);
  // Dans le composant parent (ex: CampusDetailComponent)
@ViewChild(CampusClassesTab) classesTabComponent!: CampusClassesTab;

  campusId = signal<string | null>(null);
  campus = signal<CampusResponse | null>(null);
  activeTab = signal<'overview' | 'buildings' | 'classes' | 'staff'>('overview');
  editingEquipmentId = signal<string | number | null>(null);

  // Signaux pour la modale Salle
  isRoomModalOpen = signal<boolean>(false);
  selectedRoom = signal<RoomResponse | null>(null);
  selectedBuildingForRoom = signal<BuildingResponse | null>(null);
  selectedEquipmentToEdit = signal<any | null>(null);

  // Modales et États d'éditions
  isEditModalOpen = signal<boolean>(false);
  isBuildingModalOpen = signal<boolean>(false);
  isEquipmentModalOpen = signal<boolean>(false);
  isViewEquipmentsModalOpen = signal<boolean>(false);
  isEditEquipmentModalOpen = signal<boolean>(false);
  isCreateClassModalOpen = signal<boolean>(false);
  isScheduleModalOpen = signal<boolean>(false);

  selectedBuilding = signal<BuildingResponse | null>(null);
  selectedRoomForEquipment = signal<RoomResponse | null>(null);
  selectedRoomForView = signal<RoomResponse | null>(null);

  selectedCycleId = signal<string>('');
  selectedSectionId = signal<string>('');
  selectedRoomCapacity = signal<number | null>(null);
  campusClasses = computed(() => this.classeStore.classes());
  editableSchedules = signal<ScheduleDTO[]>([]);
  classForm!: FormGroup;

// Inputs complémentaires pour l'arborescence académique
cycles = computed(() => this.academicStore.cycles() || []);
levels = computed(() => this.academicStore.levels() || []);
sections = computed(() => this.academicStore.sections() || []);
options = computed(() => this.academicStore.options() || []);



  // Signal pour contrôler l'ouverture de la modale
  isCreateModalOpen = signal<boolean>(false);

  // Appelé lors de la soumission du formulaire
  handleCreateClass(classData: any) {
    // Transmettre la requête de création au store ou service backend
    this.isCreateModalOpen.set(false);
  }

  equipmentForm = {
    name: '',
    quantity: 1,
    state: 'GOOD',
  };

  // Démarrer l'édition
  startEquipmentEdit(item: any) {
    this.editingEquipmentId.set(item.id);
    this.editForm = {
      name: item.name || item.equipmentName || '',
      quantity: item.quantity ?? item.qty ?? 1,
      state: item.state || item.status || 'GOOD',
    };
  }

  // Annuler l'édition
  cancelEquipmentEdit() {
    this.editingEquipmentId.set(null);
  }

  // Computed Properties
  canEdit = computed(() => {
    const userData = this.storageService.getUser();
    const roles = userData?.user?.roles || [];
    const roleKeys = roles.map((r: any) =>
      typeof r === 'string' ? r : r.slug || r.name || r.id || '',
    );
    return roleKeys.includes('ROLE_ADMIN_ECOLE') || roleKeys.includes('ROLE_ADMIN')|| roleKeys.includes('ROLE_SUPER_ADMIN');
  });

  displaySchoolId = computed(() => this.auth.user()?.school?.id || null);

  availableCampusRooms = computed(() => {
    const buildings = this.campusStore.buildings() || [];
    const roomsList: Array<{ id: string; name: string; capacity?: number; buildingName: string }> =
      [];
    buildings.forEach((b) => {
      b.rooms?.forEach((r) => {
        roomsList.push({ id: r.id, name: r.name, capacity: r.capacity, buildingName: b.name });
      });
    });
    return roomsList;
  });

  // Niveaux filtrés automatiquement selon le cycle sélectionné
  availableLevels = computed(() => {
    const cycleId = this.selectedCycleId();
    if (!cycleId) return [];
    const cycle = this.cycles().find((c) => c.id === cycleId);
    return cycle?.levels || [];
  });

  // Sections filtrées automatiquement selon le cycle et le niveau
  availableSections = computed(() => {
    const cycleId = this.selectedCycleId();
    if (!cycleId) return [];
    const cycle = this.cycles().find((c) => c.id === cycleId);
    return cycle?.sections || [];
  });

  // Options filtrées
  availableOptions = computed(() => {
    const cycleId = this.selectedCycleId();
    const sectionId = this.selectedSectionId();
    if (!cycleId || !sectionId) return [];
    const cycle = this.cycles().find((c) => c.id === cycleId);
    const section = cycle?.sections?.find((s: any) => s.id === sectionId);
    return section?.options || [];
  });

  ngOnInit(): void {
    this.initClassForm();

    // 1. Récupérer le schoolId et charger la structure académique
    const schoolId = this.displaySchoolId();
    if (schoolId) {
      this.academicStore.loadCycles(schoolId); // 👈 Transmettre le schoolId
    } else {
      // Fallback via le storage service si la computed est encore null
      const userSchoolId = this.storageService.getUser()?.user?.school?.id;
      if (userSchoolId) {
        this.academicStore.loadCycles(userSchoolId);
      }
    }

    const id = this.route.snapshot.paramMap.get('id');
    this.campusId.set(id);

    if (id) {
      this.loadCampusDetails(id);
      this.campusStore.loadBuildings(id);
      this.loadCampusClasses(id);
    } else {
      this.goBack();
    }
  }

  // Vos méthodes métier restent dans le parent (gestion des modales, soumissions, etc.)
  private initClassForm(): void {
    this.classForm = this.fb.group({
      cycleId: ['', Validators.required],
      sectionId: [''],
      optionId: [''],
      levelId: ['', Validators.required],
      roomId: ['', Validators.required],
      name: ['', Validators.required],
      maxCapacity: [30, [Validators.required, Validators.min(1)]],
    });
  }

  loadCampusDetails(id: string): void {
    this.campusStore.getCampusById(id).subscribe({
      next: (data) => this.campus.set(data),
      error: () => this.goBack(),
    });
  }

  loadCampusClasses(campusId: string): void {
    this.classeStore.loadClassesByCampus(campusId);
  }

  setTab(tab: 'overview' | 'buildings' | 'classes' | 'staff'): void {
    this.activeTab.set(tab);
  }

  getDayLabel(day: string): string {
    const DAYS_ORDER: Record<string, string> = {
      MONDAY: 'Lundi',
      TUESDAY: 'Mardi',
      WEDNESDAY: 'Mercredi',
      THURSDAY: 'Jeudi',
      FRIDAY: 'Vendredi',
      SATURDAY: 'Samedi',
      SUNDAY: 'Dimanche',
    };
    return DAYS_ORDER[day] || day;
  }

  openEquipmentModal(room: any): void {
    this.selectedRoomForEquipment.set(room);
    this.isEquipmentModalOpen.set(true);
  }

  openViewEquipmentsModal(room: RoomResponse): void {
    // Retrouver la salle rafraîchie dans le store
    const updatedRoom =
      this.campusStore
        .buildings()
        ?.flatMap((b) => b.rooms)
        ?.find((r) => r?.id === room.id) || room;

    // 🔍 LOG 1 : Inspecter le contenu complet de la salle et ses équipements
    console.log('--- CHARGEMENT ÉQUIPEMENTS DE LA SALLE ---');
    console.log('Salle sélectionnée :', updatedRoom);
    console.table(updatedRoom?.equipments); // Affiche sous forme de tableau clair dans la console DevTools

    this.selectedRoomForEquipment.set(updatedRoom);
    this.isViewEquipmentsModalOpen.set(true);
  }

  openCreateClassModal(): void {
    this.initClassForm();
    this.selectedCycleId.set('');
    this.selectedSectionId.set('');
    this.selectedRoomCapacity.set(null);
    this.isCreateClassModalOpen.set(true);
      this.classForm.reset();
      this.isCreateClassModalOpen.set(true);
  }

  onDeleteClass(classId: string): void {
    if (confirm('Voulez-vous vraiment supprimer cette classe ?')) {
      this.classeStore.deleteClass(classId, () => {
        this.toast.showSuccess('Classe supprimée !');
        if (this.campusId()) this.loadCampusClasses(this.campusId()!);
      });
    }
  }

  openScheduleModal(): void {
    const currentSchedules = this.campusStore.schedules();
    const defaultDays: ScheduleDTO['dayOfWeek'][] = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ];

    const prepared = defaultDays.map((day) => {
      const existing = currentSchedules.find((s) => s.dayOfWeek === day);
      return existing
        ? { ...existing }
        : {
            dayOfWeek: day,
            isOpen: day !== 'SUNDAY',
            morningStartTime: '08:00',
            morningEndTime: '12:00',
            eveningStartTime: '13:00',
            eveningEndTime: '17:00',
          };
    });

    this.editableSchedules.set(prepared);
    this.isScheduleModalOpen.set(true);
  }

  // Le reste des méthodes (closeModal, onSaveCampus, exportToPdf, etc.) restent ici sans modification.
  closeEditModal(): void {
    this.isEditModalOpen.set(false);
  }
  closeEquipmentModal(): void {
    this.selectedRoomForEquipment.set(null);
    this.isEquipmentModalOpen.set(false);
  }
  closeViewEquipmentsModal(): void {
    this.isViewEquipmentsModalOpen.set(false);
    this.selectedRoomForView.set(null);
  }
  closeEditEquipmentModal(): void {
    this.isEditEquipmentModalOpen.set(false);
    this.selectedEquipmentToEdit.set(null);
  }
  closeCreateClassModal(): void {
    this.isCreateClassModalOpen.set(false);
      this.isCreateClassModalOpen.set(false);
  this.classForm.reset();
  }
  closeScheduleModal(): void {
    this.isScheduleModalOpen.set(false);
  }

  goBack(): void {
    this.router.navigate(['/admin_ecole']);
  }

  // Modèle réactif pour le formulaire de bâtiment
  buildingForm = {
    name: '',
    code: '',
    floors: 1,
  };

  /**
   * Ouvre la modale en mode Création (building = null)
   * ou en mode Édition (building passe en paramètre)
   */
  openBuildingModal(building?: BuildingResponse) {
    if (building) {
      // MODE ÉDITION : On pré-remplit les données
      this.selectedBuilding.set(building);
      this.buildingForm = {
        name: building.name,
        code: building.code || '',
        floors: building.floors || 1,
      };
    } else {
      // MODE CRÉATION : On réinitialise
      this.selectedBuilding.set(null);
      this.buildingForm = { name: '', code: '', floors: 1 };
    }

    this.isBuildingModalOpen.set(true);
  }

  closeBuildingModal() {
    this.isBuildingModalOpen.set(false);
    this.selectedBuilding.set(null);
  }

  saveBuilding() {
    const currentCampusId = this.campus()?.id;

    if (!currentCampusId) {
      this.toast.showError('ID du campus manquant');
      return;
    }

    // Empêche les clics multiples si une requête est déjà en cours
    if (this.campusStore.isSubmitting()) return;

    const selected = this.selectedBuilding();

    if (selected) {
      // ÉDITION
      const updateDto = {
        campusId: currentCampusId,
        name: this.buildingForm.name,
        code: this.buildingForm.code || undefined,
      };

      this.campusStore.updateBuilding(
        selected.id,
        updateDto,
        () => this.closeBuildingModal(), // Succès : fermeture de la modale + Toast déjà déclenché dans le Store
      );
    } else {
      // CRÉATION
      const createDto = {
        campusId: currentCampusId,
        name: this.buildingForm.name,
        code: this.buildingForm.code || undefined,
        floors: this.buildingForm.floors,
      };

      this.campusStore.createBuilding(
        createDto,
        () => this.closeBuildingModal(), // Succès : fermeture de la modale + Toast déjà déclenché dans le Store
      );
    }
  }

  closeRoomModal() {
    this.isRoomModalOpen.set(false);
    this.selectedRoom.set(null);
    this.selectedBuildingForRoom.set(null);
  }

  // Formulaire lié aux options du HTML
  roomForm = {
    name: '',
    capacity: 30,
    type: 'CLASSROOM',
  };

  /**
   * Ouvre la modale en mode Création ou Édition
   */
  openRoomModal(building: BuildingResponse, room?: RoomResponse) {
    this.selectedBuildingForRoom.set(building);

    if (room) {
      // ÉDITION
      this.selectedRoom.set(room);
      this.roomForm = {
        name: room.name,
        capacity: room.capacity || 30,
        type: room.type || 'CLASSROOM',
      };
    } else {
      // CRÉATION
      this.selectedRoom.set(null);
      this.roomForm = {
        name: '',
        capacity: 30,
        type: 'CLASSROOM',
      };
    }

    this.isRoomModalOpen.set(true);
  }

  /**
   * Enregistre les modifications ou crée une nouvelle salle
   */
  saveRoom() {
    const currentCampusId = this.campus()?.id || this.campusStore.campuses()[0]?.id;
    const building = this.selectedBuildingForRoom();

    if (!currentCampusId || !building) {
      this.toast.showError('Campus ou bâtiment introuvable');
      return;
    }

    if (this.campusStore.isSubmitting()) return;

    const room = this.selectedRoom();

    if (room) {
      // 1. MODIFICATION (RoomRequest)
      this.campusStore.updateRoom(
        room.id,
        {
          name: this.roomForm.name,
          capacity: this.roomForm.capacity,
          type: this.roomForm.type,
        },
        currentCampusId,
        () => this.closeRoomModal(),
      );
    } else {
      // 2. CRÉATION (CreateRoomRequest)
      this.campusStore.createRoom(
        {
          buildingId: building.id,
          name: this.roomForm.name,
          capacity: this.roomForm.capacity,
          type: this.roomForm.type,
        },
        currentCampusId,
        () => this.closeRoomModal(),
      );
    }
  }

  /**
   * Enregistre l'équipement dans la salle
   */
  saveEquipment() {
    const room = this.selectedRoomForEquipment();
    const currentCampusId = this.campus()?.id || this.campusStore.campuses()[0]?.id;

    if (!room || !currentCampusId) return;

    const dto = {
      roomId: room.id,
      name: this.equipmentForm.name,
      quantity: this.equipmentForm.quantity,
      state: this.equipmentForm.state,
    };

    this.campusStore.addEquipmentToRoom(dto, currentCampusId, () => {
      this.closeEquipmentModal();
    });
  }

  // --- EXPORTS PDF ET EXCEL ---

  exportPDF() {
    const room = this.selectedRoomForEquipment();
    if (!room) return;
    const equipments = (room.equipments || []) as EquipmentResponse[];
    this.exportService.exportEquipmentsToPdf(room.name, equipments);
  }

  exportExcel() {
    const room = this.selectedRoomForEquipment();
    if (!room) return;
    const equipments = (room.equipments || []) as EquipmentResponse[];
    this.exportService.exportEquipmentsToExcel(room.name, equipments);
  }

  editForm = {
    name: '',
    quantity: 1,
    state: 'GOOD',
  };
  // Sauvegarder la modification
  saveEquipmentEdit() {
    const room = this.selectedRoomForEquipment();
    const equipment = this.selectedEquipmentToEdit();
    if (!room || !equipment) return;

    const updatedData = {
      id: equipment.id,
      name: this.editForm.name,
      quantity: this.editForm.quantity,
      state: this.editForm.state,
    };

    this.campusStore.updateEquipment(room.id, updatedData, this.campus()?.id, () => {
      // Mise à jour réactive de la liste dans la modale
      const updatedEquipments = (room.equipments || []).map((eq: any) =>
        eq.id === equipment.id ? { ...eq, ...updatedData } : eq,
      );
      this.selectedRoomForEquipment.set({ ...room, equipments: updatedEquipments });
      this.closeEditEquipmentModal();
    });
  }

  // ✅ Accepte une chaîne de caractères ou undefined/null
  getStatusLabel(state?: string | null): string {
    if (!state) return 'Inconnu';

    switch (state) {
      case 'EXCELLENT':
        return 'Neuf / Excellent';
      case 'GOOD':
        return 'Bon état';
      case 'NEED_REPAIR':
        return 'À réparer';
      case 'DAMAGED':
        return 'Endommagé / HS';
      default:
        return state;
    }
  }

  openEditEquipmentModal(item: any) {
    this.selectedEquipmentToEdit.set(item);
    this.editForm = {
      name: item.name || item.equipmentName || '',
      quantity: item.quantity ?? item.qty ?? 1,
      state: item.state || item.status || 'GOOD',
    };
    this.isEditEquipmentModalOpen.set(true);
  }

  onDeleteEquipment(item: any) {
    const room = this.selectedRoomForEquipment();
    const equipmentId = item.id || item._id;

    if (!room) {
      this.notificationService.error('Aucune salle sélectionnée.');
      return;
    }

    if (!equipmentId) {
      this.notificationService.error("Impossible de supprimer : ID d'équipement manquant.");
      return;
    }

    // Utilisation de la Snackbar interactive
    this.notificationService.askQuestion(
      `Voulez-vous vraiment supprimer "${item.name || 'cet équipement'}" ?`,
      'Supprimer',
      () => {
        this.campusStore.deleteEquipment(room.id, equipmentId, this.campus()?.id, () => {
          // Mise à jour réactive de la liste d'équipements de la salle
          const updatedEquipments = (room.equipments || []).filter(
            (eq: any) => (eq.id || eq._id) !== equipmentId,
          );
          this.selectedRoomForEquipment.set({ ...room, equipments: updatedEquipments });
        });
      },
    );
  }


onSaveClass(classData: any): void {
  const currentCampusId = this.campus()?.id;
  if (!currentCampusId) return;

  if (classData.id) {
    const updateDto: UpdateClassDTO = {
      ...classData,
      schoolId: this.displaySchoolId() || '',
      campusId: currentCampusId,
    };

    this.classeStore.updateClass(classData.id, updateDto, () => {
      this.closeCreateClassModal();
      this.classeStore.loadClassesByCampus(currentCampusId); // Rafraîchissement automatique des données
    });
  } else {
    const createDto: CreateClassDTO = {
      ...classData,
      schoolId: this.displaySchoolId() || '',
      campusId: currentCampusId,
    };

    this.classeStore.createClass(createDto, () => {
      this.closeCreateClassModal();
      this.classeStore.loadClassesByCampus(currentCampusId); // Rafraîchissement automatique des données
    });
  }
}


// Signal pour gérer la visibilité de la modale
isModalOpen = signal<boolean>(false);

// Ouvre la modale
openModal(): void {
  this.isModalOpen.set(true);
}

// Ferme la modale
closeModal(): void {
  this.isModalOpen.set(false);
}

}
