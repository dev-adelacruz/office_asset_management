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
  } | null;
  isLoading: boolean;
  isUpdatingProfile: boolean;
  error: string | null;
  profileError: string | null;
}
