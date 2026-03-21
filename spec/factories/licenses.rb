# frozen_string_literal: true

FactoryBot.define do
  factory :license do
    software_name { Faker::App.name }
    vendor { Faker::Company.name }
    license_key { Faker::Alphanumeric.alphanumeric(number: 32).upcase }
    total_seats { Faker::Number.between(from: 1, to: 100) }
    cost { Faker::Commerce.price(range: 50.0..5000.0) }
    expiry_date { Faker::Date.forward(days: 365) }
    renewal_contact { Faker::Internet.email }
    purchase_order_number { "PO-#{Faker::Alphanumeric.alphanumeric(number: 8).upcase}" }

    trait :active do
      expiry_date { Date.today + 60 }
    end

    trait :expiring_soon do
      expiry_date { Date.today + 15 }
    end

    trait :expired do
      expiry_date { Date.today - 30 }
    end
  end
end
