# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    password { SecureRandom.hex }
    role { :employee }

    trait :executive do
      role { :executive }
    end

    trait :manager do
      role { :manager }
    end

    trait :employee do
      role { :employee }
    end
  end
end
