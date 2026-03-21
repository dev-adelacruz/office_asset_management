# frozen_string_literal: true

resources :assets, only: [ :index, :create, :update ] do
  collection do
    get :export
  end
  resource :status, only: [ :update ], controller: "assets/statuses"
  resources :assignment_logs, only: [ :index, :create, :update ], controller: "assets/assignment_logs"
end
