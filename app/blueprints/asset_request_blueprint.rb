# frozen_string_literal: true

class AssetRequestBlueprint < Blueprinter::Base
  identifier :id

  fields :asset_type, :justification, :urgency, :preferred_fulfillment_date,
         :status, :notes, :asset_id, :license_id, :created_at, :updated_at

  association :user, blueprint: UserBlueprint

  field :asset do |request|
    next nil unless request.asset

    {
      id: request.asset.id,
      name: request.asset.name,
      status: request.asset.status,
      category: request.asset.category
    }
  end

  field :license do |request|
    next nil unless request.license

    {
      id: request.license.id,
      software_name: request.license.software_name,
      vendor: request.license.vendor
    }
  end

  view :with_timeline do
    association :asset_request_status_logs, blueprint: AssetRequestStatusLogBlueprint, name: :status_logs
  end
end
