# frozen_string_literal: true

FactoryBot.define do
  factory :asset_request_status_log do
    association :asset_request
    association :changed_by, factory: [ :user, :employee ]
    from_status { nil }
    to_status { "pending" }
  end
end
