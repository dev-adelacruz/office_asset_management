# frozen_string_literal: true

class Assets::LogAssetStatusChangeInteractor
  include Interactor

  # Reads:  context.asset, context.previous_status, context.status, context.current_user
  # Writes: context.asset_status_log
  def call
    context.asset_status_log = AssetStatusLog.create!(
      asset: context.asset,
      changed_by: context.current_user,
      from_status: context.previous_status,
      to_status: context.status
    )
  end
end
