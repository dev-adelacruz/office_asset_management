# frozen_string_literal: true

class License < ApplicationRecord
  encrypts :license_key

  validates :software_name, presence: true
  validates :vendor, presence: true
  validates :license_key, presence: true
  validates :total_seats, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :cost, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :expiry_date, presence: true

  has_many :license_seats, dependent: :destroy
  has_many :users, through: :license_seats
  has_many :notifications, as: :notifiable, dependent: :destroy

  def seats_used
    license_seats.count
  end

  def seats_available
    total_seats - seats_used
  end

  def status
    today = Date.today
    return "expired" if expiry_date < today
    return "expiring_soon" if expiry_date <= today + 30

    "active"
  end
end
