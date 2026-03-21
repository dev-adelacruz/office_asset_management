# frozen_string_literal: true

class Asset < ApplicationRecord
  include Auditable
  enum :category, {
    laptop: "laptop",
    monitor: "monitor",
    peripheral: "peripheral",
    furniture: "furniture",
    other: "other"
  }

  enum :condition, {
    brand_new: "new",
    good: "good",
    fair: "fair",
    poor: "poor"
  }

  enum :status, {
    available: "available",
    assigned: "assigned",
    under_maintenance: "under_maintenance",
    retired: "retired",
    lost: "lost"
  }

  has_many :asset_status_logs, dependent: :destroy
  has_many :asset_assignment_logs, dependent: :destroy

  validates :name, presence: true
  validates :category, presence: true
  validates :serial_number, presence: true, uniqueness: true
  validates :purchase_date, presence: true
  validates :purchase_cost, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :condition, presence: true
  validates :asset_code, uniqueness: true

  before_create :generate_asset_code

  private

  def generate_asset_code
    self.asset_code = loop do
      code = "ASSET-#{SecureRandom.alphanumeric(6).upcase}"
      break code unless Asset.exists?(asset_code: code)
    end
  end
end
