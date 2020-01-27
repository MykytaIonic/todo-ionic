import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import { SignupService } from 'src/app/shared/services/signup.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  public credentialsForm: FormGroup;

  constructor(
    private authService: AuthService,
    private route: Router,
    private signupService: SignupService
  ) { }

  ngOnInit(): void {
    this.credentialsForm = new FormGroup({
      email: new FormControl ('', [Validators.required, Validators.email], this.validateEmailNotTaken.bind(this)),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  validateEmailNotTaken(control: AbstractControl) {
    return this.signupService.checkEmailNotTaken(control.value).subscribe(res => {
      if (res) {
        alert("User has already exists");
      }
      else {
        return { emailTaken: true };
      }
    });
  }

  public register(registerForm: FormGroup): void {
    if (registerForm.valid) {
        this.authService.register(this.credentialsForm.value).subscribe(res => {
        });
    }
    else {
      alert("Form is not valid!");
    }
  }

  public toPreviousPage(): void {
    this.route.navigate(['/login']);
  }

}
