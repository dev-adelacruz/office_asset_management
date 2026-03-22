# frozen_string_literal: true

class Assets::PersistAssetInteractor
  include Interactor

  # Reads:  context.asset_params, context.asset (nil = create, present = update)
  # Writes: context.asset
  def call
    if context.asset
      context.asset.update!(context.asset_params)
    else
      context.asset = Asset.create!(context.asset_params)
    end
  end
end
