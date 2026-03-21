# frozen_string_literal: true

class LicenseSeat < ApplicationRecord
  belongs_to :license
  belongs_to :user

  validates :user_id, uniqueness: { scope: :license_id, message: "is already assigned to this license" }
  validate :seat_availability, on: :create

  private

  def seat_availability
    return unless license

    if license.license_seats.count >= license.total_seats
      errors.add(:base, "No seats available. All #{license.total_seats} seat(s) are already assigned.")
    end
  end
end
