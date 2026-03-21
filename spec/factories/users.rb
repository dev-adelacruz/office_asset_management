# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    password { SecureRandom.hex }
    role { :employee }
    name { Faker::Name.name }
    phone_number { Faker::PhoneNumber.phone_number }
    office_location { Faker::Address.city }

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
