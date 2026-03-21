# frozen_string_literal: true

class AssetStatusLogBlueprint < Blueprinter::Base
  identifier :id

  fields :from_status, :to_status, :created_at

  association :changed_by, blueprint: UserBlueprint
end
