# frozen_string_literal: true

class Assets::PersistReturnInteractor
  include Interactor

  # Reads:  context.assignment_log
  # Writes: context.assignment_log (marked as returned),
  #         context.auditable, context.audit_action, context.changes_before, context.changes_after

  def call
    context.assignment_log.update!(returned_at: Time.current)
    context.auditable = context.assignment_log
    context.audit_action = "update"
    context.changes_before = context.assignment_log.saved_changes.transform_values { |v| v[0] }
    context.changes_after = context.assignment_log.saved_changes.transform_values { |v| v[1] }
  end
end
