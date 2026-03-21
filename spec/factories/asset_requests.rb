# frozen_string_literal: true

FactoryBot.define do
  factory :asset_request do
    association :user, factory: [ :user, :employee ]
    asset_type { "physical" }
    justification { Faker::Lorem.sentence }
    urgency { "medium" }
    preferred_fulfillment_date { Faker::Date.forward(days: 14) }
    status { "pending" }

    trait :software do
      asset_type { "software" }
    end

    trait :low_urgency do
      urgency { "low" }
    end

    trait :high_urgency do
      urgency { "high" }
    end

    trait :approved do
      status { "approved" }
    end

    trait :rejected do
      status { "rejected" }
    end
  end
end
