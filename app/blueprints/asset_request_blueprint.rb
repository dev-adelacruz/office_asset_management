# frozen_string_literal: true

class AssetRequestBlueprint < Blueprinter::Base
  identifier :id

  fields :asset_type, :justification, :urgency, :preferred_fulfillment_date,
         :status, :notes, :created_at, :updated_at

  association :user, blueprint: UserBlueprint

  view :with_timeline do
    association :asset_request_status_logs, blueprint: AssetRequestStatusLogBlueprint, name: :status_logs
  end
end
