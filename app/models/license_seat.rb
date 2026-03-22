# frozen_string_literal: true

class LicenseSeat < ApplicationRecord
  belongs_to :license
  belongs_to :user

  validates :user_id, uniqueness: { scope: :license_id, message: "is already assigned to this license" }
end
