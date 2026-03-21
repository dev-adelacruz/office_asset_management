# frozen_string_literal: true

class AuditLog < ApplicationRecord
  belongs_to :actor, class_name: "User", optional: true
  belongs_to :auditable, polymorphic: true

  validates :action, presence: true, inclusion: { in: %w[create update destroy] }

  scope :recent, -> { order(created_at: :desc) }
  scope :by_actor, ->(actor_id) { where(actor_id: actor_id) if actor_id.present? }
  scope :by_action, ->(action) { where(action: action) if action.present? }
  scope :by_auditable_type, ->(type) { where(auditable_type: type) if type.present? }
  scope :from_date, ->(date) { where("created_at >= ?", date.to_date.beginning_of_day) if date.present? }
  scope :to_date, ->(date) { where("created_at <= ?", date.to_date.end_of_day) if date.present? }
end
