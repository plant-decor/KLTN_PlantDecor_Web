export interface ResponseModel<T> {
  success?: boolean;
  statusCode?: number;
  message?: string;
  payload?: T;
  data: T;
}
