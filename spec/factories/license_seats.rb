# frozen_string_literal: true

FactoryBot.define do
  factory :license_seat do
    association :license
    association :user, :employee
  end
end
