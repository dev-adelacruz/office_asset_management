# frozen_string_literal: true

scope :users, as: :api_v1_users do
  patch "password", to: "users/passwords#update", as: :change_password
  patch ":id/password", to: "users/passwords#admin_update", as: :admin_change_password
end
