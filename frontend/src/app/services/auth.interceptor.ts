import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // admin:admin123 em Base64 é YWRtaW46YWRtaW4xMjM=
  const credentials = btoa('admin:admin123');
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Basic ${credentials}`
    }
  });
  return next(authReq);
};
