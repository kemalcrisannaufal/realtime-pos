export type TableFormState = {
  status?: string;
  errors?: {
    name?: string[];
    description?: string[];
    capacity?: string[];
    status?: string[];
    _form?: string[];
  };
};
