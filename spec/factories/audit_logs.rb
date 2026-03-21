# frozen_string_literal: true

FactoryBot.define do
  factory :audit_log do
    association :actor, factory: :user
    association :auditable, factory: :asset
    action { "create" }
    changes_before { {} }
    changes_after { { "name" => "Test Asset" } }
  end
end
