import { email } from "./../../node_modules/zod/src/v4/core/regexes";
export type AuthFormState = {
  status?: string;
  errors?: {
    email?: string[];
    password?: string[];
    name?: string[];
    role?: string[];
    avatar_url?: string[];
    _form?: string[];
  };
};
