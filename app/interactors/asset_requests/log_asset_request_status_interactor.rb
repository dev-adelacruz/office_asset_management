# frozen_string_literal: true

class AssetRequests::LogAssetRequestStatusInteractor
  include Interactor

  # Reads:  context.asset_request, context.current_user, context.to_status, context.from_status (optional, nil for create)
  # Writes: context.asset_request_status_log

  def call
    context.asset_request_status_log = AssetRequestStatusLog.create!(
      asset_request: context.asset_request,
      changed_by: context.current_user,
      from_status: context.from_status,
      to_status: context.to_status
    )
  end
end
