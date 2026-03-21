# frozen_string_literal: true

class AssetRequestStatusLog < ApplicationRecord
  belongs_to :asset_request
  belongs_to :changed_by, class_name: "User"

  validates :to_status, presence: true
end
