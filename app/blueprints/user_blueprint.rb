# frozen_string_literal: true

class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :email, :role, :name, :phone_number, :office_location, :avatar_url
end
