export interface IBaseErrorInfo {
  status?: number;
  pointer?: string;
  title?: string;
  message?: string;
}

export interface IBaseErrorInfoParams extends IBaseErrorInfo {}
