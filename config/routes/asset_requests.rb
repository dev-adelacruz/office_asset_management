# frozen_string_literal: true

resources :asset_requests, only: [ :index, :show, :create, :update ]
