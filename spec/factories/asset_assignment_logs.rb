# frozen_string_literal: true

FactoryBot.define do
  factory :asset_assignment_log do
    association :asset
    association :assigned_to, factory: [ :user, :employee ]
    association :assigned_by, factory: [ :user, :manager ]
    assigned_at { 1.week.ago }
    returned_at { nil }
    notes { nil }
  end
end
