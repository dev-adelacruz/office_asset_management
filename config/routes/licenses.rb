# frozen_string_literal: true

resources :licenses, only: [ :index, :create, :update ] do
  resources :seats, only: [ :index, :create, :destroy ], controller: "licenses/seats"
end
