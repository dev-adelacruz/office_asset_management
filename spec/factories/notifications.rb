# frozen_string_literal: true

FactoryBot.define do
  factory :notification do
    association :user
    association :notifiable, factory: :license
    title { "License expiring in 30 days" }
    body { "Adobe Creative Cloud (Adobe Inc.) expires on Jan 01, 2027." }
    notification_type { "expiry_30" }
    read_at { nil }
  end
end
