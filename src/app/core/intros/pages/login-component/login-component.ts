import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Toast } from '../../../../shared/toaste/Toast';
import { AuthStoreService } from '../../../services/auth-store-service';
import { StorageService } from '../../../storage-service/storage-service';
import { LoaderComponent } from '../../../../shared/components/loader-component/loader-component';
import { Role } from '../../../models/User';


@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LoaderComponent
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent implements OnInit {
 readonly store = inject(AuthStoreService);

  private readonly fb = inject(FormBuilder);

  private readonly toast = inject(Toast);

  private readonly storageService =
    inject(StorageService);

currentYear = new Date().getFullYear();
  isLoggedIn = false;

  roles: Role[] = [];


  form = this.fb.nonNullable.group({

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      Validators.required
    ]

  });


  ngOnInit(): void {

    if (this.storageService.isLoggedIn()) {

      this.isLoggedIn = true;

      const user =
        this.storageService.getUser();
      this.roles =
        user?.user?.roles ?? [];
    }
  }


  submits(): void {

    if (this.form.invalid) {

      this.toast.info(
        'Veuillez remplir correctement le formulaire.'
      );

      this.form.markAllAsTouched();

      return;
    }


    const {
      email,
      password
    } = this.form.getRawValue();


    this.store.login({

      email,
      password

    });
  }
}
