import { Component, inject, OnInit, signal } from '@angular/core';
import { SCHOOL_IMPORTS } from '../../../../features/Schools/services/school-imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivationStore } from '../../../../features/Users/services/activation.store';
import { Toast } from '../../../../shared/toaste/Toast';

// Import épuré accessible partout

@Component({
  selector: 'app-activate-component',
  standalone : true,
   imports: [SCHOOL_IMPORTS],
  templateUrl: './activate-component.html',
  styleUrl: './activate-component.scss',
})
export class ActivateComponent implements OnInit {

readonly store = inject(ActivationStore);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(Toast)

  token = signal<string>('');

  form: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    phone: [''],
    occupation: [''],
    birthDate: [''],
    matricule: ['']
  });

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.queryParamMap.get('token');
    if (tokenParam) {
      this.token.set(tokenParam);
      this.store.verifyToken(tokenParam);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.toast.info('Les mots de passe ne correspondent pas.')
      return;
    }

    this.store.submitActivation({
      token: this.token(),
      ...this.form.value
    });
  }
}
