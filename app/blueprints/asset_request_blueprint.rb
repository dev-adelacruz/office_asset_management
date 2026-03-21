# frozen_string_literal: true

class AssetRequestBlueprint < Blueprinter::Base
  identifier :id

  fields :asset_type, :justification, :urgency, :preferred_fulfillment_date,
         :status, :notes, :created_at, :updated_at

  association :user, blueprint: UserBlueprint
end
