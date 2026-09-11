import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AcademicStore } from '../../services/academic-structure/academic.store';
import { SCHOOL_IMPORTS } from '../../services/school-imports';
import { AcademicCycle, AcademicLevel, AcademicOption, AcademicSection } from '../../models/academic.model';
import { AuthStoreService } from '../../../../core/services/auth-store-service';
import { Toast } from '../../../../shared/toaste/Toast';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditStructureDialogComponent } from '../edit-structure-dialog-component/edit-structure-dialog-component';

@Component({
  selector: 'app-classes-management',
  standalone: true,
  imports: [SCHOOL_IMPORTS],
  templateUrl: './classes-management.html',
  styleUrl: './classes-management.scss',
})
export class ClassesManagement implements OnInit {

  // --- STORES & SERVICES ---
  readonly store = inject(AcademicStore);
  private readonly authStore = inject(AuthStoreService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(Toast);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // --- ÉTATS & SIGNAUX ---

  // Navigation par sous-onglets
  activeSubTab = signal<'cycles' | 'levels' | 'sections' | 'classes'>('cycles');

  // Visibilité des formulaires de création / modales
  isCreateCycleModalOpen = signal<boolean>(false);
  isCreateLevelModalOpen = signal<boolean>(false);
  isCreateSectionModalOpen = signal<boolean>(false);
  isCreateClassModalOpen = signal<boolean>(false);
  isCreateOptionModalOpen = signal<boolean>(false);

  // Sélections pour le filtrage en cascade
  selectedCycleId = signal<string>('');
  selectedSectionId = signal<string>('');
  selectedCycleForClass = signal<string>('');

  // Contextes récupérés depuis les stores
  readonly schoolId = computed(() => this.authStore.schoolId());
  readonly academicYearIdActive = computed(() => this.store.activeYearId());

  // Getters computés pour les statistiques et les listes globales
  allLevels = computed(() => this.store.cycles().flatMap(c => c.levels || []));
  allSections = computed(() => this.store.cycles().flatMap(c => c.sections || []));

  // Cascade pour la création de classe
  availableSections = computed(() => {
    const cycleId = this.selectedCycleId();
    if (!cycleId) return [];
    const cycle = this.store.cycles().find(c => c.id === cycleId);
    return cycle?.sections || [];
  });

  availableOptions = computed(() => {
    const sectionId = this.selectedSectionId();
    if (!sectionId) return [];
    const sections = this.availableSections();
    const section = sections.find(s => s.id === sectionId);
    return section?.options || [];
  });

  availableLevels = computed(() => {
    const cycleId = this.selectedCycleId();
    if (!cycleId) return [];
    const cycle = this.store.cycles().find(c => c.id === cycleId);
    return cycle?.levels || [];
  });

  availableLevelsForSelectedCycle = computed(() => {
    const cycleId = this.selectedCycleForClass();
    if (!cycleId) return [];
    const cycle = this.store.cycles().find((c: any) => c.id === cycleId);
    return cycle?.levels || [];
  });

  // --- FORMULAIRES ---

  // 1. Formulaire Cycle
  readonly cycleForm = this.fb.group({
    name: ['', [Validators.required]],
  });

  // 2. Formulaire Niveau
  readonly levelForm = this.fb.group({
    cycleId: ['', [Validators.required]],
    name: ['', [Validators.required]],
    numericOrder: [1, [Validators.required, Validators.min(1)]],
  });

  // 3. Formulaire Section
  readonly sectionForm = this.fb.group({
    cycleId: ['', [Validators.required]],
    name: ['', [Validators.required]],
  });

  // 4. Formulaire Option
  readonly optionForm = this.fb.group({
    sectionId: ['', [Validators.required]],
    name: ['', [Validators.required]],
    code: ['', [Validators.required]]
  });

  // 5. Formulaire Classe
  readonly classForm = this.fb.group({
    cycleId: ['', [Validators.required]],
    sectionId: [''],
    optionId: [''],
    levelId: ['', [Validators.required]],
    name: ['', [Validators.required]],
    maxCapacity: [40, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    const id = this.schoolId();
    if (id) {
      this.store.loadCycles(id);
      this.store.loadYears(id);
    }
  }

  // --- NAVIGATION ---
  setSubTab(tab: 'cycles' | 'levels' | 'sections' | 'classes'): void {
    this.activeSubTab.set(tab);
  }

  // --- CASCADES & ÉVÉNEMENTS SELECT ---
  onClassCycleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const cycleId = target.value;
    this.selectedCycleForClass.set(cycleId);
    this.classForm.patchValue({ levelId: '' });
  }

  onCycleChange(event: Event): void {
    const cycleId = (event.target as HTMLSelectElement).value;
    this.selectedCycleId.set(cycleId);
    this.selectedSectionId.set('');

    this.classForm.patchValue({
      sectionId: '',
      optionId: '',
      levelId: ''
    });
  }

  onSectionChange(event: Event): void {
    const sectionId = (event.target as HTMLSelectElement).value;
    this.selectedSectionId.set(sectionId);
    this.classForm.patchValue({ optionId: '' });
  }

  // --- ACTIONS : CRÉATION ---

  onAddCycle(): void {
    const currentSchoolId = this.schoolId();

    if (!currentSchoolId) {
      this.toast.info('Établissement non sélectionné.');
      return;
    }

    if (this.cycleForm.valid) {
      const dto = {
        schoolId: currentSchoolId,
        name: this.cycleForm.value.name!,
      };

      this.store.createCycle(dto, () => {
        this.cycleForm.reset();
        this.isCreateCycleModalOpen.set(false);
        this.toast.success('Cycle créé avec succès.');
      });
    }
  }

  onAddLevel(): void {
    if (this.levelForm.valid) {
      const { cycleId, name, numericOrder } = this.levelForm.value;
      this.store.addLevelToCycle(cycleId!, name!, numericOrder!, () => {
        this.levelForm.reset({ numericOrder: 1 });
        this.isCreateLevelModalOpen.set(false);
        this.toast.success('Niveau d\'études ajouté au cycle.');
      });
    }
  }

  onAddSection(): void {
    if (this.sectionForm.valid) {
      const dto = this.sectionForm.value as { cycleId: string; name: string };
      this.store.createSection(dto, () => {
        this.sectionForm.reset();
        this.isCreateSectionModalOpen.set(false);
        this.toast.success('Section ajoutée au cycle.');
      });
    }
  }

  onAddOption(): void {
    if (this.optionForm.valid) {
      this.store.addOption(this.optionForm.value, () => {
        this.isCreateOptionModalOpen.set(false);
        this.optionForm.reset();
        this.toast.success('Option ajoutée avec succès.');
      });
    }
  }


  // --- ACTIONS : MODIFICATION ET SUPPRESSION ---

  // 1. CYCLES
  onEditCycle(cycle: AcademicCycle): void {
    const hasDeps = (cycle.levels?.length || 0) > 0 || (cycle.sections?.length || 0) > 0;

    const dialogRef = this.dialog.open(EditStructureDialogComponent, {
      width: '400px',
      data: {
        title: 'Modifier le Cycle',
        name: cycle.name,
        hasDependents: hasDeps,
        dependentMessage: hasDeps ? 'Certaines liaisons (niveaux/sections) sont verrouillées.' : undefined
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.name.trim() !== cycle.name) {
        this.store.updateCycle(cycle.id, result.name.trim());
        this.notify('Cycle mis à jour avec succès');
      }
    });
  }

  onDeleteCycle(cycle: AcademicCycle): void {
    if ((cycle.levels?.length || 0) > 0 || (cycle.sections?.length || 0) > 0) {
      this.notify('Impossible de supprimer : ce cycle possède des dépendances actives.', true);
      return;
    }
    this.store.deleteCycle(cycle.id);
    this.notify('Cycle supprimé');
  }

  // 2. NIVEAUX
  onEditLevel(level: AcademicLevel): void {
    const dialogRef = this.dialog.open(EditStructureDialogComponent, {
      width: '400px',
      data: {
        title: 'Modifier le Niveau',
        name: level.name,
        numericOrder: level.orderIndex || 1,
        hasDependents: false
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.updateLevel(level.id, result.name.trim(), result.numericOrder);
        this.notify('Niveau mis à jour avec succès');
      }
    });
  }

  onDeleteLevel(level: AcademicLevel): void {
    const hasClasses = this.store.classes().some((c) => c.levelId === level.id);
    if (hasClasses) {
      this.notify('Impossible de supprimer : des classes sont rattachées à ce niveau.', true);
      return;
    }
    this.store.deleteLevel(level.id);
    this.notify('Niveau supprimé');
  }

  // 3. SECTIONS
  onEditSection(section: AcademicSection): void {
    const dialogRef = this.dialog.open(EditStructureDialogComponent, {
      width: '400px',
      data: {
        title: 'Modifier la Section',
        name: section.name,
        hasDependents: false
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.name.trim() !== section.name) {
        this.store.updateSection(section.id, result.name.trim());
        this.notify('Section mise à jour avec succès');
      }
    });
  }

  onDeleteSection(section: AcademicSection): void {
    this.store.deleteSection(section.id);
    this.notify('Section supprimée');
  }

  // 4. OPTIONS
// 4. OPTIONS
  onEditOption(option: AcademicOption): void {
    const dialogRef = this.dialog.open(EditStructureDialogComponent, {
      width: '400px',
      data: {
        title: 'Modifier l\'Option Pédagogique',
        name: option.name,
        code: option.code,
        hasDependents: false
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedName = result.name?.trim() || option.name;
        const updatedCode = result.code?.trim() || option.code;

        // CORRECTION : On passe option.id, updatedName et updatedCode en arguments distincts
        this.store.updateOption(
          option.id,
          updatedName,
          updatedCode,
          () => this.notify('Option mise à jour avec succès')
        );
      }
    });
  }

  onDeleteOption(option: AcademicOption): void {
    const hasClasses = this.store.classes().some((c: any) => c.optionId === option.id);
    if (hasClasses) {
      this.notify('Impossible de supprimer : des classes sont associées à cette option.', true);
      return;
    }

    if (confirm(`Voulez-vous vraiment supprimer l'option "${option.name}" ?`)) {
      this.store.deleteOption(option.id);
      this.notify('Option supprimée');
    }
  }

  // --- HELPER SNACKBAR ---
  private notify(message: string, isError = false): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3500,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: isError ? ['snackbar-error'] : ['snackbar-success']
    });
  }
}
