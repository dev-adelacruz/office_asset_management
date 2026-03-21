# frozen_string_literal: true

FactoryBot.define do
  factory :asset do
    name { Faker::Commerce.product_name }
    category { :laptop }
    serial_number { Faker::Alphanumeric.unique.alphanumeric(number: 12).upcase }
    purchase_date { Faker::Date.backward(days: 365) }
    purchase_cost { Faker::Commerce.price(range: 100.0..5000.0) }
    condition { :brand_new }
    status { :available }
    manufacturer { Faker::Company.name }
    model { Faker::Alphanumeric.alphanumeric(number: 8).upcase }

    trait :laptop do
      category { :laptop }
    end

    trait :monitor do
      category { :monitor }
    end

    trait :peripheral do
      category { :peripheral }
    end

    trait :assigned do
      status { :assigned }
    end

    trait :under_maintenance do
      status { :under_maintenance }
    end

    trait :retired do
      status { :retired }
    end

    trait :lost do
      status { :lost }
    end
  end
end
