# frozen_string_literal: true

class AssetRequest < ApplicationRecord
  belongs_to :user

  ASSET_TYPES = %w[physical software].freeze
  URGENCIES = %w[low medium high].freeze
  STATUSES = %w[pending approved rejected].freeze

  validates :asset_type, presence: true, inclusion: { in: ASSET_TYPES }
  validates :justification, presence: true
  validates :urgency, presence: true, inclusion: { in: URGENCIES }
  validates :status, presence: true, inclusion: { in: STATUSES }
end
