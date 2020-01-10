import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';
import { SignupService } from 'src/app/shared/services/signup.service';

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

  ngOnInit() {
    this.credentialsForm = new FormGroup({
      email: new FormControl ('', [Validators.required, Validators.email], this.validateEmailNotTaken.bind(this)),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  validateEmailNotTaken(control: AbstractControl) {
    return this.signupService.checkEmailNotTaken(control.value).subscribe(res => {
      return res ? null : { emailTaken: true };
    });
  }

  public register(registerForm: FormGroup) {
    if (registerForm.valid) {
        this.authService.register(this.credentialsForm.value).subscribe(res => {
        });
    }
    else {
      alert("Form is not valid!");
    }
  }

  private toPreviousPage() {
  this.route.navigate(['/login']);
  }

}
