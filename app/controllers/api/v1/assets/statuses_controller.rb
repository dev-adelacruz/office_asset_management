# frozen_string_literal: true

class Api::V1::Assets::StatusesController < Api::BaseController
  before_action :require_manager_or_executive!
  before_action :set_asset

  VALID_STATUSES = Asset.statuses.keys.freeze

  def update
    new_status = params[:status]

    unless VALID_STATUSES.include?(new_status)
      return render json: {
        status: 422,
        message: "Invalid status. Must be one of: #{VALID_STATUSES.join(', ')}."
      }, status: :unprocessable_entity
    end

    from_status = @asset.status

    if @asset.update(status: new_status)
      AssetStatusLog.create!(
        asset: @asset,
        changed_by: current_user,
        from_status: from_status,
        to_status: @asset.status
      )

      render json: {
        status: {
          code: 200,
          message: "Asset status updated successfully.",
          data: { asset: AssetBlueprint.render_as_hash(@asset) }
        }
      }, status: :ok
    else
      render json: {
        status: 422,
        message: @asset.errors.full_messages.join(", ")
      }, status: :unprocessable_entity
    end
  end

  private

  def require_manager_or_executive!
    authorize_role!(:manager, :executive)
  end

  def set_asset
    @asset = Asset.find(params[:asset_id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "Asset not found." }, status: :not_found
  end
end
