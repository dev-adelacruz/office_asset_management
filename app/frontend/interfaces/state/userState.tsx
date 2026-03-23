interface UserState {
  isSignedIn: boolean;
  token: string | null;
  user: {
    id: number | null;
    email: string | null;
    role: string | null;
    name: string | null;
    phone_number: string | null;
    office_location: string | null;
    avatar_url: string | null;
    pending_email?: string | null;
  } | null;
  isLoading: boolean;
  isUpdatingProfile: boolean;
  isChangingPassword: boolean;
  isChangingEmail: boolean;
  error: string | null;
  profileError: string | null;
  passwordError: string | null;
  emailError: string | null;
  emailPendingMessage: string | null;
}
