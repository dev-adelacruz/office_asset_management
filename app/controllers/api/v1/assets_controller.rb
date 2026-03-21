# frozen_string_literal: true

class Api::V1::AssetsController < Api::BaseController
  before_action :require_manager_or_executive!, only: [ :create ]

  def index
    assets = Asset.all.order(created_at: :desc)
    render json: {
      status: {
        code: 200,
        message: "Assets retrieved successfully.",
        data: { assets: AssetBlueprint.render_as_hash(assets) }
      }
    }, status: :ok
  end

  def create
    asset = Asset.new(asset_params)

    if asset.save
      render json: {
        status: {
          code: 201,
          message: "Asset registered successfully.",
          data: { asset: AssetBlueprint.render_as_hash(asset) }
        }
      }, status: :created
    else
      render json: {
        status: 422,
        message: asset.errors.full_messages.join(", ")
      }, status: :unprocessable_entity
    end
  end

  private

  def require_manager_or_executive!
    authorize_role!(:manager, :executive)
  end

  def asset_params
    params.require(:asset).permit(
      :name, :category, :serial_number, :purchase_date, :purchase_cost,
      :condition, :manufacturer, :model, :warranty_expiry, :location, :notes
    )
  end
end
