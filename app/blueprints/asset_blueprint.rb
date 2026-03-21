# frozen_string_literal: true

class AssetBlueprint < Blueprinter::Base
  identifier :id

  fields :asset_code, :name, :category, :serial_number, :purchase_date,
         :purchase_cost, :condition, :status, :manufacturer, :model,
         :warranty_expiry, :location, :notes, :created_at, :updated_at

  view :with_history do
    association :asset_assignment_logs, blueprint: AssetAssignmentLogBlueprint, name: :assignment_logs
  end
end
