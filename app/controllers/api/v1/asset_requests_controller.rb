# frozen_string_literal: true

class Api::V1::AssetRequestsController < Api::BaseController
  before_action :require_manager_or_executive!, only: [ :update ]
  before_action :set_asset_request, only: [ :show, :update ]

  def index
    per_page = params[:per_page].present? ? [ [ params[:per_page].to_i, 1 ].max, 100 ].min : 25
    page     = params[:page].present? ? [ params[:page].to_i, 1 ].max : 1
    offset   = (page - 1) * per_page

    scope       = scoped_requests
    total       = scope.count
    requests    = scope.limit(per_page).offset(offset)
    total_pages = (total.to_f / per_page).ceil

    render json: {
      status: {
        code: 200,
        message: "Asset requests retrieved successfully.",
        data: {
          asset_requests: AssetRequestBlueprint.render_as_hash(requests),
          pagination: {
            current_page: page,
            total_pages: total_pages,
            total_count: total,
            per_page: per_page
          }
        }
      }
    }, status: :ok
  end

  def show
    render json: {
      status: {
        code: 200,
        message: "Asset request retrieved successfully.",
        data: { asset_request: AssetRequestBlueprint.render_as_hash(@asset_request, view: :with_timeline) }
      }
    }, status: :ok
  end

  def create
    result = AssetRequests::CreateAssetRequestUsecase.call(
      asset_request_params: asset_request_params,
      current_user: current_user
    )

    if result.success?
      render json: {
        status: {
          code: 201,
          message: "Asset request submitted successfully.",
          data: { asset_request: AssetRequestBlueprint.render_as_hash(result.asset_request) }
        }
      }, status: :created
    else
      render json: { status: 422, message: result.message }, status: :unprocessable_entity
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

    old_status = @asset_request.status

    ActiveRecord::Base.transaction do
      @asset_request.update!(approval_params)

      @asset_request.asset_request_status_logs.create!(
        changed_by: current_user,
        from_status: old_status,
        to_status: @asset_request.status
      )

      if new_status == "approved" && @asset_request.asset.present?
        @asset_request.asset.update!(status: :assigned)
        @asset_request.asset.asset_assignment_logs.create!(
          assigned_to: @asset_request.user,
          assigned_by: current_user,
          assigned_at: Time.current
        )
      end
    end

    render json: {
      status: {
        code: 200,
        message: "Asset request #{new_status} successfully.",
        data: { asset_request: AssetRequestBlueprint.render_as_hash(@asset_request) }
      }
    }, status: :ok
  rescue ActiveRecord::RecordInvalid => e
    render json: {
      status: 422,
      message: e.record.errors.full_messages.join(", ")
    }, status: :unprocessable_entity
  end

  private

  def scoped_requests
    scope = if current_user.role.in?(%w[manager executive])
      AssetRequest.includes(:user, :asset, :license).order(urgency_order_sql, created_at: :desc)
    else
      current_user.asset_requests.includes(:asset, :license).order(created_at: :desc)
    end

    scope = scope.where("justification ILIKE ?", "%#{params[:q]}%") if params[:q].present?
    scope = scope.where(status: params[:status]) if params[:status].present?
    scope = scope.where(asset_type: params[:asset_type]) if params[:asset_type].present?
    scope
  end

  def urgency_order_sql
    Arel.sql("CASE urgency WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 END")
  end

  def require_manager_or_executive!
    authorize_role!(:manager, :executive)
  end

  def set_asset_request
    @asset_request = AssetRequest.includes(:asset, :license, :user).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "Asset request not found." }, status: :not_found
  end

  def asset_request_params
    params.require(:asset_request).permit(
      :asset_type, :justification, :urgency, :preferred_fulfillment_date, :notes,
      :asset_id, :license_id
    )
  end

  def approval_params
    params.require(:asset_request).permit(:status, :notes)
  end
end
