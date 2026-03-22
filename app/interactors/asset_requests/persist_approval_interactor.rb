# frozen_string_literal: true

class AssetRequests::PersistApprovalInteractor
  include Interactor

  # Reads:  context.asset_request
  # Writes: context.asset_request (status set to approved), context.from_status, context.to_status

  def call
    context.from_status = context.asset_request.status
    context.asset_request.update!(status: "approved")
    context.to_status = context.asset_request.status
  rescue ActiveRecord::RecordInvalid => e
    context.fail!(message: e.record.errors.full_messages.join(", "))
  end
end
