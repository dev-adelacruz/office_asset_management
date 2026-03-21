interface UserState {
  isSignedIn: boolean;
  token: string | null;
  user: {
    id: number | null;
    email: string | null;
    role: string | null;
  } | null;
  isLoading: boolean;
  error: string | null;
}
