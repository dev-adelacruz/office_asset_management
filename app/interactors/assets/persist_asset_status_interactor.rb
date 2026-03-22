# frozen_string_literal: true

class Assets::PersistAssetStatusInteractor
  include Interactor

  # Reads:  context.asset, context.status
  # Writes: context.asset (updated), context.previous_status,
  #         context.auditable, context.audit_action, context.changes_before, context.changes_after

  def call
    context.previous_status = context.asset.status
    context.asset.update!(status: context.status)
    context.auditable = context.asset
    context.audit_action = "update"
    context.changes_before = context.asset.saved_changes.transform_values { |v| v[0] }
    context.changes_after = context.asset.saved_changes.transform_values { |v| v[1] }
  end
end
