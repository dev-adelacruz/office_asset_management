# frozen_string_literal: true

class Assets::ValidateAssetParamsInteractor
  include Interactor

  # Reads:  context.asset_params
  # Writes: nothing (fails context on invalid params)
  def call
    asset = context.asset || Asset.new
    asset.assign_attributes(context.asset_params)
    context.fail!(message: asset.errors.full_messages.join(", ")) unless asset.valid?
  rescue ArgumentError => e
    context.fail!(message: e.message)
  end
end
