# frozen_string_literal: true

class AssetStatusLog < ApplicationRecord
  belongs_to :asset
  belongs_to :changed_by, class_name: "User"

  validates :to_status, presence: true
end
