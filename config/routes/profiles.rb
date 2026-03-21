# frozen_string_literal: true

scope :users, as: :users do
  resource :profile, only: [ :update ], controller: "users/profiles"
  patch ":id/profile", to: "users/profiles#update", as: :user_profile
end
