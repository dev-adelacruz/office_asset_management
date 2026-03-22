# frozen_string_literal: true

class Assets::SetAssetStatusAvailableInteractor
  include Interactor

  # Reads:  context.asset, context.all_returned
  # Writes: context.asset (status updated to :available only if all_returned is true)
  def call
    return unless context.all_returned

    context.asset.update!(status: :available)
  end
end
