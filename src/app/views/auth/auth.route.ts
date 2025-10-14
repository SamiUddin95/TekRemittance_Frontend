import { Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';

export const AUTH_ROUTES: Routes = [
      {
            path: 'sign-in',
            component: SignInComponent,
            data: { title: "Sign In" },
        },
        {
            path: 'sign-up',
            component: SignUpComponent,
            data: { title: "Sign Up" },
        },
];
