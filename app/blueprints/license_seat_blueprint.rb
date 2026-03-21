# frozen_string_literal: true

class LicenseSeatBlueprint < Blueprinter::Base
  identifier :id

  fields :created_at

  association :user, blueprint: UserBlueprint
end
