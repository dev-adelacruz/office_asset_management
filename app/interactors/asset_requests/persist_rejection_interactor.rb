# frozen_string_literal: true

class AssetRequests::PersistRejectionInteractor
  include Interactor

  # Reads:  context.asset_request, context.rejection_note
  # Writes: context.asset_request (status set to rejected, notes saved), context.from_status, context.to_status

  def call
    context.from_status = context.asset_request.status
    context.asset_request.update!(status: "rejected", notes: context.rejection_note)
    context.to_status = context.asset_request.status
  rescue ActiveRecord::RecordInvalid => e
    context.fail!(message: e.record.errors.full_messages.join(", "))
  end
end
