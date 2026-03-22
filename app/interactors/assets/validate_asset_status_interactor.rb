# frozen_string_literal: true

class Assets::ValidateAssetStatusInteractor
  include Interactor

  VALID_STATUSES = Asset.statuses.keys.freeze

  # Reads:  context.status, context.asset
  # Writes: nothing (fails context if status is not in VALID_STATUSES)
  def call
    return if VALID_STATUSES.include?(context.status)

    context.fail!(message: "Invalid status. Must be one of: #{VALID_STATUSES.join(', ')}.")
  end
end
