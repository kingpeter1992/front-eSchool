import { Component, inject, OnInit, signal } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../../Schools/services/school-imports';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { EnrollmentStatusResponseModel } from '../../Models/enrollment.model';
import { environment } from '../../../../env';

@Component({
  selector: 'app-verify-status-component',
   standalone: true,
    imports: [SCHOOL_IMPORTS],
  templateUrl: './verify-status-component.html',
  styleUrl: './verify-status-component.scss',
})
export class VerifyStatusComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BASIC_URL}/enrollments`;


  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly result = signal<EnrollmentStatusResponseModel | null>(null);

  readonly searchForm: FormGroup = this.fb.group({
    registrationNo: ['', [Validators.required, Validators.minLength(3)]]
  });

  ngOnInit(): void {
    // Récupération automatique du numéro dans l'URL (queryParam: ?registrationNo=...)
    const queryNo = this.route.snapshot.queryParamMap.get('registrationNo');
    if (queryNo) {
      this.searchForm.patchValue({ registrationNo: queryNo });
      this.checkStatus(queryNo);
    }
  }

  onSearch(): void {
    // Utiliser 'this.searchForm' au lieu de 'searchForm'
    if (this.searchForm.invalid) return;

    const registrationNo = this.searchForm.value.registrationNo.trim();
    this.checkStatus(registrationNo);
  }

  private checkStatus(registrationNo: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.result.set(null);

    this.http.get<EnrollmentStatusResponseModel>(`${this.apiUrl}/public/status/${registrationNo}`)
      .subscribe({
        next: (data) => {
          this.result.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          const message = err?.error?.message || 'Aucun dossier trouvé pour ce numéro.';
          this.errorMessage.set(message);
          this.isLoading.set(false);
        }
      });
  }

  readonly isGeneratingPdf = signal<boolean>(false);
  readonly todayDate = new Date();

  downloadReceiptPdf(): void {
    const element = document.getElementById('receipt-pdf-content');
    if (!element) return;

    this.isGeneratingPdf.set(true);

    html2canvas(element, {
      scale: 2, // Améliore la résolution du texte/image
      useCORS: true,
      logging: false
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');

      // Configuration format A4 (Portrait, millimètres)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Recu_Inscription_${this.result()?.registrationNo || 'eSchool'}.pdf`);

      this.isGeneratingPdf.set(false);
    }).catch((err) => {
      console.error('Erreur génération PDF :', err);
      this.isGeneratingPdf.set(false);
    });
  }
}
