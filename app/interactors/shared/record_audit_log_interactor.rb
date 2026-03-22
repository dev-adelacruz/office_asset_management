# frozen_string_literal: true

class Shared::RecordAuditLogInteractor
  include Interactor

  # Reads:  context.current_user, context.auditable,
  #         context.audit_action, context.changes_before, context.changes_after
  # Writes: nothing

  def call
    AuditLog.create!(
      actor: context.current_user,
      auditable: context.auditable,
      action: context.audit_action,
      changes_before: context.changes_before,
      changes_after: context.changes_after
    )
  end
end
