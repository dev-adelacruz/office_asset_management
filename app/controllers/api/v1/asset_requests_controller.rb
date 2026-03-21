# frozen_string_literal: true

class Api::V1::AssetRequestsController < Api::BaseController
  def index
    requests = if current_user.role.in?(%w[manager executive])
      AssetRequest.includes(:user).order(created_at: :desc)
    else
      current_user.asset_requests.order(created_at: :desc)
    end

    render json: {
      status: {
        code: 200,
        message: "Asset requests retrieved successfully.",
        data: { asset_requests: AssetRequestBlueprint.render_as_hash(requests) }
      }
    }, status: :ok
  end

  def create
    request = current_user.asset_requests.new(asset_request_params)

    if request.save
      render json: {
        status: {
          code: 201,
          message: "Asset request submitted successfully.",
          data: { asset_request: AssetRequestBlueprint.render_as_hash(request) }
        }
      }, status: :created
    else
      render json: {
        status: 422,
        message: request.errors.full_messages.join(", ")
      }, status: :unprocessable_entity
    end
  end

  private

  def asset_request_params
    params.require(:asset_request).permit(
      :asset_type, :justification, :urgency, :preferred_fulfillment_date, :notes
    )
  end
end
