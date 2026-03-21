# frozen_string_literal: true

require "csv"

class Api::V1::AssetsController < Api::BaseController
  before_action :require_manager_or_executive!, only: [ :create, :update ]
  before_action :set_asset, only: [ :update ]

  def index
    per_page = params[:per_page].present? ? [ [ params[:per_page].to_i, 1 ].max, 100 ].min : 25
    page     = params[:page].present? ? [ params[:page].to_i, 1 ].max : 1
    offset   = (page - 1) * per_page

    scope       = filtered_assets
    total       = scope.count
    assets      = scope.order(created_at: :desc).limit(per_page).offset(offset)
    total_pages = (total.to_f / per_page).ceil

    render json: {
      status: {
        code: 200,
        message: "Assets retrieved successfully.",
        data: {
          assets: AssetBlueprint.render_as_hash(assets),
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

  def export
    assets = filtered_assets.order(created_at: :desc)
    csv = CSV.generate(headers: true) do |csv|
      csv << %w[asset_code name category serial_number purchase_date purchase_cost
                condition status manufacturer model warranty_expiry location notes created_at]
      assets.each do |asset|
        csv << [
          asset.asset_code, asset.name, asset.category, asset.serial_number,
          asset.purchase_date, asset.purchase_cost, asset.condition, asset.status,
          asset.manufacturer, asset.model, asset.warranty_expiry, asset.location,
          asset.notes, asset.created_at.iso8601
        ]
      end
    end
    send_data csv, filename: "assets_#{Date.today}.csv", type: "text/csv", disposition: "attachment"
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

  def update
    if @asset.update(asset_params)
      render json: {
        status: {
          code: 200,
          message: "Asset updated successfully.",
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

  def filtered_assets
    scope = Asset.all
    scope = scope.where("name ILIKE :q OR serial_number ILIKE :q OR notes ILIKE :q", q: "%#{params[:q]}%") if params[:q].present?
    scope = scope.where(category: params[:category]) if params[:category].present?
    scope = scope.where(status: params[:status]) if params[:status].present?
    scope = scope.where("location ILIKE ?", "%#{params[:location]}%") if params[:location].present?
    scope = scope.where("purchase_date >= ?", params[:purchase_date_from]) if params[:purchase_date_from].present?
    scope = scope.where("purchase_date <= ?", params[:purchase_date_to]) if params[:purchase_date_to].present?
    scope
  end

  def require_manager_or_executive!
    authorize_role!(:manager, :executive)
  end

  def set_asset
    @asset = Asset.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "Asset not found." }, status: :not_found
  end

  def asset_params
    params.require(:asset).permit(
      :name, :category, :serial_number, :purchase_date, :purchase_cost,
      :condition, :manufacturer, :model, :warranty_expiry, :location, :notes
    )
  end
end
