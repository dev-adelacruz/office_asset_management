# frozen_string_literal: true

class AssetRequests::PersistAssetRequestInteractor
  include Interactor

  # Reads:  context.asset_request_params, context.current_user
  # Writes: context.asset_request, context.to_status,
  #         context.auditable, context.audit_action, context.changes_before, context.changes_after

  def call
    request = context.current_user.asset_requests.build(context.asset_request_params)
    request.save!
    context.asset_request = request
    context.to_status = request.status
    context.auditable = request
    context.audit_action = "create"
    context.changes_before = {}
    context.changes_after = request.attributes
  rescue ActiveRecord::RecordInvalid => e
    context.fail!(message: e.record.errors.full_messages.join(", "))
  end
end
