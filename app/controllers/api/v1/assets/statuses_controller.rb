# frozen_string_literal: true

class Api::V1::Assets::StatusesController < Api::BaseController
  before_action :require_manager_or_executive!
  before_action :set_asset

  def update
    result = Assets::UpdateAssetStatusUsecase.call(
      asset: @asset,
      status: params[:status],
      current_user: current_user
    )

    if result.success?
      render json: {
        status: {
          code: 200,
          message: "Asset status updated successfully.",
          data: { asset: AssetBlueprint.render_as_hash(result.asset) }
        }
      }, status: :ok
    else
      render json: { status: 422, message: result.message }, status: :unprocessable_entity
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
