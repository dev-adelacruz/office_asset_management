# frozen_string_literal: true

class AssetAssignmentLog < ApplicationRecord
  belongs_to :asset
  belongs_to :assigned_to, class_name: "User"
  belongs_to :assigned_by, class_name: "User"

  validates :assigned_at, presence: true
end
