import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class PopupService {
  confirmLogout(title = 'Session expired', text = 'You will be logged out.'): Promise<boolean> {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'Logout',
      showCancelButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(r => r.isConfirmed === true);
  }

  // CconfirmSuccess(title = 'Success', text = ''): Promise<void> {
  //   return Swal.fire({
  //     title,
  //     text,
  //     icon: 'success',
  //     confirmButtonText: 'OK'
  //   }).then(() => {});
  // }

  success(title = 'Success', text = ''){
    return Swal.fire({
      title,
      text,
      icon: 'success',
    });
  }
  error(title = 'Error', text = '') {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'OK'
    }).then(() => {});
  }
}
