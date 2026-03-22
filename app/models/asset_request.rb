# frozen_string_literal: true

class AssetRequest < ApplicationRecord
  include Auditable
  belongs_to :user
  belongs_to :asset, optional: true
  belongs_to :license, optional: true

  has_many :asset_request_status_logs, dependent: :destroy

  ASSET_TYPES = %w[physical software].freeze
  URGENCIES = %w[low medium high].freeze
  STATUSES = %w[pending approved rejected].freeze

  validates :asset_type, presence: true, inclusion: { in: ASSET_TYPES }
  validates :justification, presence: true
  validates :urgency, presence: true, inclusion: { in: URGENCIES }
  validates :status, presence: true, inclusion: { in: STATUSES }

  validate :only_one_item_reference

  private

  def only_one_item_reference
    if asset_id.present? && license_id.present?
      errors.add(:base, "cannot reference both an asset and a license")
    end
  end
end
