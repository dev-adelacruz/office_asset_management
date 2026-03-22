# frozen_string_literal: true

class Assets::PersistAssetStatusInteractor
  include Interactor

  # Reads:  context.asset, context.status
  # Writes: context.asset (updated), context.previous_status
  def call
    context.previous_status = context.asset.status
    context.asset.update!(status: context.status)
  end
end
