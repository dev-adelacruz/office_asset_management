# frozen_string_literal: true

class Assets::SetAssetStatusAssignedInteractor
  include Interactor

  # Reads:  context.asset
  # Writes: context.asset (status updated to :assigned)
  def call
    context.asset.update!(status: :assigned)
  end
end
