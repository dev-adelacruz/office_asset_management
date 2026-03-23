# frozen_string_literal: true

scope :users, as: :api_v1_users do
  patch "email", to: "users/emails#update", as: :change_email
  patch ":id/email", to: "users/emails#admin_update", as: :admin_change_email
  get "confirm_email", to: "users/emails#confirm", as: :confirm_email
end
