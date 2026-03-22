# frozen_string_literal: true

class AssetRequests::ValidateAssetRequestParamsInteractor
  include Interactor

  # Reads:  context.asset_request_params
  # Writes: nothing (fails context on invalid params)

  def call
    request = AssetRequest.new(context.asset_request_params)
    request.status ||= "pending"
    request.valid?
    errors = request.errors.reject { |e| e.attribute.to_s == "user" }
    context.fail!(message: errors.map(&:full_message).join(", ")) if errors.any?
  end
end
