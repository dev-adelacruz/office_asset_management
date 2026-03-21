# frozen_string_literal: true

resources :assets, only: [ :index, :create ] do
  resource :status, only: [ :update ], controller: "assets/statuses"
end
