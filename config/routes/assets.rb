# frozen_string_literal: true

resources :assets, only: [ :index, :create, :update ] do
  resource :status, only: [ :update ], controller: "assets/statuses"
end
