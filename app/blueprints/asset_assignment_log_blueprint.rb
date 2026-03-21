# frozen_string_literal: true

class AssetAssignmentLogBlueprint < Blueprinter::Base
  identifier :id

  fields :assigned_at, :returned_at, :notes, :created_at

  association :assigned_to, blueprint: UserBlueprint
  association :assigned_by, blueprint: UserBlueprint
end
