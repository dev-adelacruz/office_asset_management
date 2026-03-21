# frozen_string_literal: true

class LicenseBlueprint < Blueprinter::Base
  identifier :id

  fields :software_name, :vendor, :license_key, :total_seats, :cost,
         :expiry_date, :renewal_contact, :purchase_order_number, :notes,
         :created_at, :updated_at

  field :status do |license|
    license.status
  end

  field :seats_used do |license|
    license.seats_used
  end

  field :seats_available do |license|
    license.seats_available
  end

  association :license_seats, blueprint: LicenseSeatBlueprint
end
