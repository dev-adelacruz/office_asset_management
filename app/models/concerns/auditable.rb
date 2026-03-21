# frozen_string_literal: true

module Auditable
  extend ActiveSupport::Concern

  included do
    after_create  :audit_create
    after_update  :audit_update
    after_destroy :audit_destroy
  end

  private

  def audit_create
    return unless Current.user

    AuditLog.create!(
      actor: Current.user,
      auditable: self,
      action: "create",
      changes_before: {},
      changes_after: attributes
    )
  end

  def audit_update
    return unless Current.user
    return if saved_changes.blank?

    AuditLog.create!(
      actor: Current.user,
      auditable: self,
      action: "update",
      changes_before: saved_changes.transform_values { |v| v[0] },
      changes_after: saved_changes.transform_values { |v| v[1] }
    )
  end

  def audit_destroy
    return unless Current.user

    AuditLog.create!(
      actor: Current.user,
      auditable: self,
      action: "destroy",
      changes_before: attributes,
      changes_after: {}
    )
  end
end
