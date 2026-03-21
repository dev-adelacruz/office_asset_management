# frozen_string_literal: true

class Api::V1::AssetRequestsController < Api::BaseController
  before_action :require_manager_or_executive!, only: [ :update ]
  before_action :set_asset_request, only: [ :update ]

  def index
    requests = if current_user.role.in?(%w[manager executive])
      AssetRequest.includes(:user).order(urgency_order_sql, created_at: :desc)
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

  def update
    new_status = approval_params[:status]

    if new_status == "rejected" && approval_params[:notes].blank?
      return render json: {
        status: 422,
        message: "Notes is required when rejecting a request."
      }, status: :unprocessable_entity
    end

    if @asset_request.update(approval_params)
      render json: {
        status: {
          code: 200,
          message: "Asset request #{new_status} successfully.",
          data: { asset_request: AssetRequestBlueprint.render_as_hash(@asset_request) }
        }
      }, status: :ok
    else
      render json: {
        status: 422,
        message: @asset_request.errors.full_messages.join(", ")
      }, status: :unprocessable_entity
    end
  end

  private

  def urgency_order_sql
    Arel.sql("CASE urgency WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 END")
  end

  def require_manager_or_executive!
    authorize_role!(:manager, :executive)
  end

  def set_asset_request
    @asset_request = AssetRequest.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "Asset request not found." }, status: :not_found
  end

  def asset_request_params
    params.require(:asset_request).permit(
      :asset_type, :justification, :urgency, :preferred_fulfillment_date, :notes
    )
  end

  def approval_params
    params.require(:asset_request).permit(:status, :notes)
  end
end
