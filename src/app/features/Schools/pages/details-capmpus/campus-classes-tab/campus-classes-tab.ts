import { Component, computed, inject, input, output, signal } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../../services/school-imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-campus-classes-tab',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './campus-classes-tab.html',
  styleUrl: './campus-classes-tab.scss',
})
export class CampusClassesTab {

  private fb = inject(FormBuilder);
  // ============================================================
  // SIGNALS DE SÉLECTION (CASCADE)
  // ============================================================
  selectedCycleId = signal<string | null>(null);
  selectedLevelId = signal<string | null>(null);
  selectedSectionId = signal<string | null>(null);

  // ============================================================
  // INPUTS
  // ============================================================
  classes = input<any[]>([]);
  canEdit = input<boolean>(false);
  availableRooms = input<any[]>([]);

  // Arborescence complète transmise par le composant parent ou le Store
  tree = input<any[]>([]);
  cycles = input<any[]>([]);
  levels = input<any[]>([]);
  sections = input<any[]>([]);
  options = input<any[]>([]);

  // ============================================================
  // OUTPUTS
  // ============================================================
  openCreateClassModal = output<void>();
  deleteClass = output<string>();
  close = output<void>();
  saveClass = output<any>();
  assignTeacher = output<any>(); // Émission pour ouvrir la modale / l'action d'assignation de titulaire

  // ============================================================
  // FILTRES DE RECHERCHE & LISTE
  // ============================================================
  searchQuery = signal<string>('');
  selectedFilterCycle = signal<string>('ALL');

  // ============================================================
  // MODALE & FORMULAIRE
  // ============================================================
  isModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  editingClassId = signal<string | null>(null);
  classForm!: FormGroup;

  isEditMode = computed(() => !!this.editingClassId());
  modalTitle = computed(() =>
    this.isEditMode() ? 'Modifier la classe' : 'Créer une nouvelle classe',
  );

  // ============================================================
  // SÉLECTEURS CASCADE & CALCULS (COMPUTED)
  // ============================================================

  // Trouve le nœud du cycle sélectionné dans l'arborescence
  selectedCycleNode = computed(() => {
    const id = this.selectedCycleId();
    if (!id) return null;

    const source = this.tree().length > 0 ? this.tree() : this.cycles();
    return source.find((c) => c.id?.toString() === id.toString()) || null;
  });

  // Niveaux filtrés pour le cycle courant
  filteredLevels = computed(() => {
    const node = this.selectedCycleNode();
    if (node && node.levels) {
      return node.levels;
    }
    const cycleId = this.selectedCycleId();
    if (!cycleId) return [];
    return this.levels().filter((l) => l.cycleId?.toString() === cycleId.toString());
  });

  // Sections filtrées pour le cycle ou niveau courant
  filteredSections = computed(() => {
    const node = this.selectedCycleNode();
    if (node && node.sections) {
      return node.sections;
    }
    const levelId = this.selectedLevelId();
    if (!levelId) return [];
    return this.sections().filter((s) => s.levelId?.toString() === levelId.toString());
  });

  // Options filtrées pour la section courante
  filteredOptions = computed(() => {
    const sectionId = this.selectedSectionId();
    if (!sectionId) return [];

    const sectionNode = this.filteredSections().find(
      (s: { id: { toString: () => string } }) => s.id?.toString() === sectionId.toString(),
    );
    if (sectionNode && sectionNode.options) {
      return sectionNode.options;
    }

    return this.options().filter((o) => o.sectionId?.toString() === sectionId.toString());
  });

  // Liste enrichie des classes avec recherche, filtrage et calcul du taux de remplissage
// Liste enrichie des classes avec correspondance du nom de salle et calculs
filteredClasses = computed(() => {
  let list = this.classes();
  const rooms = this.availableRooms(); // Récupération de la liste des salles disponibles
  const query = this.searchQuery().toLowerCase().trim();
  const cycle = this.selectedFilterCycle();

  // 1. Mappage et résolution du nom de la salle
  list = list.map((c) => {
    // Recherche de la salle par son ID (ou par son code si votre clé est c.roomCode/c.roomId)
    const matchingRoom = rooms.find(
      (r) => r.id?.toString() === c.roomId?.toString() || r.code === c.roomName
    );

    // Priorité : Nom de la salle trouvée > roomName existant > Non assignée
    const displayRoomName = matchingRoom ? matchingRoom.name : (c.roomName || 'Non assignée');

    const enrolledCount = c.enrolledCount || 0;
    const maxCapacity = c.maxCapacity || 0;
    const occupancyRate = maxCapacity > 0 ? (enrolledCount / maxCapacity) * 100 : 0;

    return {
      ...c,
      roomName: displayRoomName, // On remplace le code par le nom lisible
      enrolledCount,
      occupancyRate: Math.min(occupancyRate, 100),
    };
  });

  // 2. Filtre par cycle
  if (cycle !== 'ALL') {
    list = list.filter(
      (c) => c.cycleId?.toString() === cycle.toString() || c.cycleName === cycle,
    );
  }

  // 3. Filtre par recherche textuelle
  if (query) {
    list = list.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.roomName?.toLowerCase().includes(query) ||
        c.cycleName?.toLowerCase().includes(query) ||
        c.levelName?.toLowerCase().includes(query) ||
        c.sectionName?.toLowerCase().includes(query) ||
        c.optionName?.toLowerCase().includes(query) ||
        c.mainTeacherName?.toLowerCase().includes(query),
    );
  }

  return list;
});

  // ============================================================
  // LIFECYCLE & FORM INIT
  // ============================================================
  ngOnInit(): void {
    this.initForm();
  }

 private initForm(): void {
  this.classForm = this.fb.group({
    cycleId: [null, Validators.required],
    levelId: [{ value: null, disabled: true }, Validators.required],
    sectionId: [{ value: null, disabled: true }],
    optionId: [{ value: null, disabled: true }],
    name: ['', Validators.required],
    roomId: [null, Validators.required], // Salle obligatoire si associée à un créneau
    shift: ['MORNING', Validators.required], // MORNING par défaut
    maxCapacity: [30, [Validators.required, Validators.min(1)]],
  });
}

  // ============================================================
  // GESTION DU CHANGEMENT DE SÉLECTION (CASCADE & SALLE)
  // ============================================================
  onCycleChange(cycleId: string | null): void {
    const normalizedId = cycleId ? cycleId.toString() : null;
    this.selectedCycleId.set(normalizedId);
    this.selectedLevelId.set(null);
    this.selectedSectionId.set(null);

    this.classForm.patchValue({ levelId: null, sectionId: null, optionId: null });

    const levelControl = this.classForm.get('levelId');
    const sectionControl = this.classForm.get('sectionId');
    const optionControl = this.classForm.get('optionId');

    if (normalizedId) {
      levelControl?.enable();
      sectionControl?.enable();
    } else {
      levelControl?.disable();
      sectionControl?.disable();
    }
    optionControl?.disable();
  }

  onLevelChange(): void {
    const levelId = this.classForm.get('levelId')?.value;
    const normalizedId = levelId ? levelId.toString() : null;

    this.selectedLevelId.set(normalizedId);
    this.selectedSectionId.set(null);

    const sectionControl = this.classForm.get('sectionId');
    const optionControl = this.classForm.get('optionId');

    optionControl?.disable();
    optionControl?.setValue(null);

    if (normalizedId && this.filteredSections().length > 0) {
      sectionControl?.enable();
    } else {
      sectionControl?.disable();
    }
    sectionControl?.setValue(null);
  }

  onSectionChange(sectionId: string | null): void {
    const normalizedId = sectionId ? sectionId.toString() : null;
    this.selectedSectionId.set(normalizedId);
    this.classForm.patchValue({ optionId: null });

    const optionControl = this.classForm.get('optionId');

    if (normalizedId && this.filteredOptions().length > 0) {
      optionControl?.enable();
    } else {
      optionControl?.disable();
    }
  }

  onRoomChange(roomId: string | null): void {
    const capacityControl = this.classForm.get('maxCapacity');

    if (!roomId) {
      capacityControl?.enable();
      capacityControl?.setValue(30);
      return;
    }

    const selectedRoom = this.availableRooms().find(
      (r) => r.id?.toString() === roomId.toString(),
    );

    if (selectedRoom && selectedRoom.capacity) {
      capacityControl?.setValue(selectedRoom.capacity);
      capacityControl?.disable();
    } else {
      capacityControl?.enable();
    }
  }

  // ============================================================
  // MODALE ACTIONS (OPEN / EDIT / ASSIGN / CLOSE)
  // ============================================================
  openCreate(): void {
    this.editingClassId.set(null);
    this.resetCascade();

this.classForm.reset({
    cycleId: null,
    levelId: null,
    sectionId: null,
    optionId: null,
    name: '',
    roomId: null,
    shift: 'MORNING',
    maxCapacity: 30,
  });

    this.classForm.get('maxCapacity')?.enable();
    this.classForm.get('levelId')?.disable();
    this.classForm.get('sectionId')?.disable();
    this.classForm.get('optionId')?.disable();

    this.isSubmitting.set(false);
    this.isModalOpen.set(true);
    this.openCreateClassModal.emit();
  }

  openEdit(classItem: any): void {
    if (!classItem) return;

    this.editingClassId.set(classItem.id);
    this.resetCascade();

this.classForm.patchValue({
    cycleId: classItem.cycleId ?? null,
    levelId: classItem.levelId ?? null,
    sectionId: classItem.sectionId ?? null,
    optionId: classItem.optionId ?? null,
    name: classItem.name ?? '',
    roomId: classItem.roomId ?? null,
    shift: classItem.shift ?? 'MORNING',
    maxCapacity: classItem.maxCapacity ?? 30,
  });

    if (classItem.roomId) {
      this.onRoomChange(classItem.roomId);
    } else {
      this.classForm.get('maxCapacity')?.enable();
    }

    if (classItem.cycleId) {
      this.selectedCycleId.set(classItem.cycleId.toString());
      this.classForm.get('levelId')?.enable();
      this.classForm.get('sectionId')?.enable();
    }

    if (classItem.levelId) {
      this.selectedLevelId.set(classItem.levelId.toString());
    }

    if (classItem.sectionId) {
      this.selectedSectionId.set(classItem.sectionId.toString());
      if (this.filteredOptions().length > 0) {
        this.classForm.get('optionId')?.enable();
      }
    }

    this.isSubmitting.set(false);
    this.isModalOpen.set(true);
  }

  openAssignTeacher(classItem: any): void {
    if (!classItem) return;
    this.assignTeacher.emit(classItem);
  }

  closeModal(): void {
    if (this.isSubmitting()) return;

    this.isModalOpen.set(false);
    this.editingClassId.set(null);
    this.resetCascade();

    this.classForm.reset({
      cycleId: null,
      levelId: null,
      sectionId: null,
      optionId: null,
      name: '',
      roomId: null,
      maxCapacity: 30,
    });

    this.close.emit();
  }

  private resetCascade(): void {
    this.selectedCycleId.set(null);
    this.selectedLevelId.set(null);
    this.selectedSectionId.set(null);
  }

  // ============================================================
  // SUBMIT & DELETE
  // ============================================================
  onSubmit(): void {
    if (this.classForm.invalid) {
      this.classForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = {
      ...this.classForm.getRawValue(),
      id: this.editingClassId(),
    };

    this.saveClass.emit(formValue);
  }

  onDelete(classId: string): void {
    if (!classId) return;
    this.deleteClass.emit(classId);
  }

  isInvalid(controlName: string): boolean {
    const control = this.classForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
